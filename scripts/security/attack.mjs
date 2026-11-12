// Security regression checks against a LOCAL instance only (see run.sh).
// Turnstile is stubbed: token "pass" verifies, anything else fails.
// Usage: node attack.mjs [baseUrl]
import { execSync } from "node:child_process";

const BASE = process.argv[2] || "http://localhost:3100";
const results = [];
let ipCounter = 10;
const RUN = Math.floor(Math.random() * 200) + 20;
const freshIp = () => `10.${RUN}.${Math.floor(ipCounter / 250)}.${(ipCounter++ % 250) + 1}`;
const redis = (cmd) => execSync(`redis-cli --raw ${cmd}`).toString().trim();

function check(id, name, ok, detail = "") {
  results.push({ id, name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${id}  ${name}${detail ? "  -- " + detail : ""}`);
}

async function req(path, { method = "GET", body, cookie, ip, headers = {}, raw } = {}) {
  const h = { ...headers };
  if (body !== undefined && !raw) h["content-type"] = "application/json";
  if (cookie) h.cookie = cookie;
  h["x-forwarded-for"] = ip || freshIp();
  const res = await fetch(BASE + path, {
    method,
    headers: h,
    body: body === undefined ? undefined : raw ? body : JSON.stringify(body),
    redirect: "manual",
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, headers: res.headers, text, json };
}

async function login(email, password, ip) {
  const r = await req("/api/admin/login", { method: "POST", body: { email, password }, ip });
  const sc = r.headers.get("set-cookie") || "";
  const m = sc.match(/nexus_session=([^;]+)/);
  return { r, cookie: m ? `nexus_session=${m[1]}` : null, setCookie: sc };
}

async function nextOpenSunday() {
  const r = await req("/signup");
  const dates = [...new Set(r.text.match(/\d{4}-\d{2}-\d{2}/g) || [])];
  return dates;
}

function signupBody(date, extra = {}) {
  return { date, name: "Test Family", email: "t@example.com", phone: "(555) 555-1234", meal: "Tacos", turnstileToken: "pass", ...extra };
}

// ---------- setup ----------
await req("/admin"); // triggers owner seed
const owner = await login("owner@test.local", "Owner-Test-Pass-1");
if (!owner.cookie) { console.log("owner login failed", owner.r.status, owner.r.text); process.exit(1); }
await req("/api/admin/accounts", { method: "POST", cookie: owner.cookie, body: { email: "viewer@test.local", password: "Viewer-Pass-1", role: "viewer" } });
const viewer = await login("viewer@test.local", "Viewer-Pass-1");
await req("/api/admin/accounts", { method: "POST", cookie: owner.cookie, body: { email: "timing@test.local", password: "Timing-Pass-1", role: "viewer" } });

const dates = await nextOpenSunday();
const scheduleDates = dates.slice(); // dates rendered in signup page week picker
const [d1, d2, d3, d4, d5] = scheduleDates.slice(-5);

// ---------- 1.4 authn/authz ----------
const adminRoutes = [
  ["POST", "/api/admin/signups", { date: d1, name: "x", email: "x@x.com", phone: "5555555555", meal: "x" }, "admin"],
  ["PATCH", "/api/admin/signups/abc", { meal: "x" }, "admin"],
  ["DELETE", "/api/admin/signups/abc", undefined, "admin"],
  ["DELETE", "/api/admin/needs-contact/abc", undefined, "admin"],
  ["GET", "/api/admin/qr", undefined, "admin"],
  ["PUT", "/api/admin/overview", {}, "owner"],
  ["PUT", "/api/admin/settings", {}, "owner"],
  ["GET", `/api/admin/weeks/${d1}`, undefined, "owner"],
  ["PATCH", `/api/admin/weeks/${d1}`, { noNexus: true }, "owner"],
  ["GET", "/api/admin/export", undefined, "owner"],
  ["POST", "/api/admin/accounts", { email: "e@e.com", password: "12345678", role: "owner" }, "owner"],
  ["PATCH", "/api/admin/accounts/abc", { disabled: true }, "owner"],
  ["DELETE", "/api/admin/accounts/abc", undefined, "owner"],
];
let unauthOk = true, unauthDetail = [];
for (const [m, p, b] of adminRoutes) {
  const r = await req(p, { method: m, body: b });
  if (r.status !== 401) { unauthOk = false; unauthDetail.push(`${m} ${p} -> ${r.status}`); }
}
check("1.4a", "Logged-out requests to every admin API get 401", unauthOk, unauthDetail.join("; "));

let roleOk = true, roleDetail = [];
for (const [m, p, b] of adminRoutes.filter((x) => x[3] === "owner")) {
  const r = await req(p, { method: m, body: b, cookie: viewer.cookie });
  if (r.status !== 403) { roleOk = false; roleDetail.push(`${m} ${p} -> ${r.status}`); }
}
check("1.4b", "Viewer gets 403 on every owner-only API", roleOk, roleDetail.join("; "));

const forged = await req("/api/admin/export", { cookie: "nexus_session=forged-token-123" });
check("1.4c", "Forged session token rejected", forged.status === 401, `status ${forged.status}`);

{
  const bad = [];
  for (const p of ["/admin", "/admin/settings", "/admin/accounts", "/admin/volunteers"]) {
    const r = await req(p);
    if (!(r.status >= 300 && r.status < 400) || !(r.headers.get("location") || "").includes("/admin/login")) bad.push(`${p} -> ${r.status}`);
  }
  check("1.4d", "Admin pages redirect logged-out users to login", bad.length === 0, bad.join("; "));
}

const vpage = await req("/admin/accounts", { cookie: viewer.cookie });
check("1.4e", "Viewer gets no owner-only data from /admin/accounts (other admins' emails absent)", !vpage.text.includes("timing@test.local") && !vpage.text.includes("owner@test.local"), `status ${vpage.status}`);

// ---------- 1.3 mass assignment ----------
const ma = await req("/api/signup", { method: "POST", body: signupBody(d1, { createdBy: "owner-id", reminderSent: true, purged: true, id: "chosen-id", updatedBy: "x" }) });
if (ma.status === 200) {
  const rec = JSON.parse(redis(`GET signup:${ma.json.id}`));
  const clean = rec.createdBy === "public" && rec.reminderSent === false && rec.purged === false && rec.id !== "chosen-id" && !rec.updatedBy;
  check("1.3a", "Public signup can't set createdBy/reminderSent/purged/id", clean, JSON.stringify({ createdBy: rec.createdBy, reminderSent: rec.reminderSent, purged: rec.purged, id: rec.id }));
  const vp = await req(`/api/admin/signups/${ma.json.id}`, { method: "PATCH", cookie: viewer.cookie, body: { meal: "Pizza", purged: true, createdBy: "evil", date: "2030-01-06", id: "z" } });
  const rec2 = JSON.parse(redis(`GET signup:${ma.json.id}`));
  check("1.3b", "Admin PATCH ignores purged/createdBy/date/id", vp.status === 200 && rec2.purged === false && rec2.createdBy === "public" && rec2.date === d1 && rec2.id === ma.json.id, JSON.stringify({ status: vp.status, purged: rec2.purged, createdBy: rec2.createdBy, date: rec2.date }));
} else {
  check("1.3a", "Public signup can't set privileged fields", false, `signup failed ${ma.status} ${ma.text}`);
}
const esc = await req("/api/admin/accounts", { method: "POST", cookie: viewer.cookie, body: { email: "mine@x.com", password: "12345678", role: "owner" } });
check("1.3c", "Viewer can't create an owner account", esc.status === 403, `status ${esc.status}`);
const selfDisable = await req(`/api/admin/accounts/${redis("GET admin:email:viewer@test.local").replace(/"/g, "")}`, { method: "PATCH", cookie: viewer.cookie, body: { disabled: false } });
check("1.3d", "Viewer can't edit account records", selfDisable.status === 403, `status ${selfDisable.status}`);

// ---------- 2.2 validation ----------
const outOfWindow = await req("/api/signup", { method: "POST", body: signupBody("2031-01-01") });
check("2.2a", "Signup for a date outside the schedule (non-Sunday, years out) rejected", outOfWindow.status === 400, `status ${outOfWindow.status}`);
const badDate = await req("/api/signup", { method: "POST", body: signupBody("2026-13-45") });
check("2.2b", "Signup with impossible date rejected", badDate.status === 400, `status ${badDate.status}`);
const longPhone = await req("/api/signup", { method: "POST", body: signupBody(d2, { phone: "a".repeat(10000) + "5555555555" }) });
check("2.2c", "10,000-char phone (containing 10 digits) rejected", longPhone.status === 400, `status ${longPhone.status}`);
const garbage = [
  { name: "<script>alert(1)</script>" },
  { meal: "' OR 1=1 --" },
  { name: "x".repeat(10000) },
  { meal: "🌮🔥".repeat(3) },
  { name: 12345 },
  { email: ["a"] },
  { date: { $gt: "" } },
  { meal: undefined },
  { turnstileToken: "x".repeat(100000) },
];
let garbageOk = true, gd = [];
for (const g of garbage) {
  const r = await req("/api/signup", { method: "POST", body: signupBody(d3, g) });
  if (r.status >= 500) { garbageOk = false; gd.push(`${JSON.stringify(g).slice(0, 40)} -> ${r.status}`); }
}
const notJson = await req("/api/signup", { method: "POST", body: "not json{", raw: true, headers: { "content-type": "text/plain" } });
if (notJson.status >= 500) { garbageOk = false; gd.push(`non-JSON -> ${notJson.status}`); }
check("2.2d", "Garbage inputs never cause a 500", garbageOk, gd.join("; "));
const xssStored = redis(`KEYS signup:*`).split("\n").map((k) => k && redis(`GET ${k}`)).filter(Boolean).some((v) => v.includes("<script>"));
if (xssStored) {
  const sched = await req("/schedule");
  check("2.2e", "Stored <script> renders inert (escaped) on public page", !sched.text.includes("<script>alert(1)</script>"));
} else {
  check("2.2e", "Stored <script> renders inert", true, "(not stored)");
}
const badWeek = await req(`/api/admin/weeks/..%2F..%2Fadmin`, { method: "PATCH", cookie: owner.cookie, body: { label: "x" } });
check("2.2f", "Weeks API rejects non-date path param", badWeek.status === 400 || badWeek.status === 404, `status ${badWeek.status}`);
const hugeLogin = await req("/api/admin/login", { method: "POST", body: { email: "owner@test.local", password: "x".repeat(200000) } });
check("2.2g", "Oversized login password rejected without heavy work", hugeLogin.status === 400, `status ${hugeLogin.status}`);

// ---------- arrival-override week is signable ----------
await req(`/api/admin/weeks/${d4}`, { method: "PATCH", cookie: owner.cookie, body: { arrivalOverride: "17:00" } });
const ovr = await req("/api/signup", { method: "POST", body: signupBody(d4) });
check("BUG-1", "Week with only an arrival-time override accepts signups", ovr.status === 200, `status ${ovr.status} ${ovr.json?.error || ""}`);

// ---------- bot protection ----------
const badTs = await req("/api/signup", { method: "POST", body: signupBody(d5, { turnstileToken: "fail" }) });
check("1.5a", "Bad Turnstile token rejected", badTs.status === 400, `status ${badTs.status}`);
const honey = await req("/api/signup", { method: "POST", body: signupBody(d5, { website: "spam.example" }) });
check("1.5b", "Honeypot filled rejected", honey.status === 400, `status ${honey.status}`);

// ---------- 1.5 rate limits ----------
async function burst(n, fn) { const codes = []; for (let i = 0; i < n; i++) codes.push(await fn(i)); return codes; }
const sip = freshIp();
const scodes = await burst(13, () => req("/api/signup", { method: "POST", ip: sip, body: { bogus: true } }));
const s429 = scodes.findIndex((r) => r.status === 429);
check("1.5c", "Signup per-IP limit returns 429", s429 > 0, `first 429 at request ${s429 + 1}`);
check("1.5d", "429 carries Retry-After", s429 > 0 && !!scodes[s429].headers.get("retry-after"), `retry-after=${s429 > 0 ? scodes[s429].headers.get("retry-after") : "n/a"}`);
const lip = freshIp();
const lcodes = await burst(12, (i) => req("/api/admin/login", { method: "POST", ip: lip, body: { email: `nobody${RUN}-${i}@x.com`, password: "wrong" } }));
const l429 = lcodes.findIndex((r) => r.status === 429);
check("1.5e", "Login per-IP limit returns 429 (different accounts, same IP)", l429 > 0, `first 429 at request ${l429 + 1}`);
const acodes = await burst(7, () => req("/api/admin/login", { method: "POST", body: { email: `target${RUN}@x.com`, password: "wrong" } }));
const a429 = acodes.findIndex((r) => r.status === 429);
check("1.5f", "Login per-account limit returns 429 (same account, rotating IPs)", a429 > 0, `first 429 at request ${a429 + 1}`);
check("1.5g", "Login 429 carries Retry-After", a429 > 0 && !!acodes[a429].headers.get("retry-after"));

// ---------- cron ----------
const cronNoAuth = await req("/api/cron/purge");
check("CRON", "Cron purge refuses unauthenticated calls", cronNoAuth.status === 401, `status ${cronNoAuth.status} (CRON_SECRET ${process.env.CRON_SECRET ? "set" : "unset"})`);
const cronWrong = await req("/api/cron/purge", { headers: { authorization: "Bearer wrong" } });
check("CRON", "Cron purge refuses a wrong secret", cronWrong.status === 401, `status ${cronWrong.status}`);
if (process.env.CRON_SECRET) {
  const cronOk = await req("/api/cron/purge", { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } });
  check("CRON", "Cron purge accepts the correct secret", cronOk.status === 200, `status ${cronOk.status} ${cronOk.text}`);
}

// ---------- CSV injection ----------
const ci = await req("/api/admin/signups", { method: "POST", cookie: owner.cookie, body: { date: d5, name: "=HYPERLINK(\"http://evil.example\",\"click\")", email: "c@x.com", phone: "5555555555", meal: "+cmd|' /C calc'!A0" } });
if (ci.status === 200) {
  // Move the record into the past so export includes it.
  const rec = JSON.parse(redis(`GET signup:${ci.json.id}`));
  rec.date = "2020-01-05";
  execSync(`redis-cli SET signup:${ci.json.id} '${JSON.stringify(rec).replace(/'/g, "'\\''")}'`);
  execSync(`redis-cli ZADD signups:by-date ${Date.UTC(2020, 0, 5, 12)} ${ci.json.id}`);
  const csv = await req("/api/admin/export", { cookie: owner.cookie });
  const line = csv.text.split("\n").find((l) => l.includes("HYPERLINK")) || "";
  check("2.2h", "CSV export neutralizes formula injection", /^"?'=/.test(line) && line.includes("'+cmd"), line.slice(0, 80));
} else {
  check("2.2h", "CSV export neutralizes formula injection", false, `setup failed ${ci.status} ${ci.text}`);
}

// ---------- 2.7 headers / 2.6 CORS ----------
const h = await req("/schedule", { headers: { origin: "https://evil.example" } });
check("2.7a", "No X-Powered-By header", !h.headers.get("x-powered-by"), `x-powered-by=${h.headers.get("x-powered-by")}`);
check("2.7b", "Permissions-Policy header present", !!h.headers.get("permissions-policy"), h.headers.get("permissions-policy") || "");
for (const k of ["strict-transport-security", "x-content-type-options", "referrer-policy", "x-frame-options", "content-security-policy"]) {
  check("2.7c", `${k} present`, !!h.headers.get(k));
}
const cors = await req("/api/admin/export", { cookie: owner.cookie, headers: { origin: "https://evil.example" } });
check("2.6", "No Access-Control-Allow-Origin on authenticated API", !cors.headers.get("access-control-allow-origin"), `acao=${cors.headers.get("access-control-allow-origin")}`);

const selfOff = await req(`/api/admin/accounts/${redis("GET admin:email:owner@test.local").replace(/"/g, "")}`, { method: "PATCH", cookie: owner.cookie, body: { disabled: true } });
check("1.3e", "Owner can't disable their own account (lockout guard)", selfOff.status === 400, `status ${selfOff.status}`);

const acctPage = await req("/admin/accounts", { cookie: owner.cookie });
check("2.3a", "Accounts page never sends password hashes to the browser", acctPage.status === 200 && acctPage.text.includes("timing@test.local") && !/\$2[aby]\$|passwordHash/.test(acctPage.text), `status ${acctPage.status}`);

// ---------- 2.8 cookies / sessions ----------
const sc = owner.setCookie.toLowerCase();
check("2.8a", "Session cookie HttpOnly+Secure+SameSite=Lax+Max-Age", sc.includes("httponly") && sc.includes("secure") && sc.includes("samesite=lax") && sc.includes("max-age=604800"), owner.setCookie.replace(/nexus_session=[^;]+/, "nexus_session=<redacted>"));
const tmp = await login("owner@test.local", "Owner-Test-Pass-1");
await req("/api/admin/logout", { method: "POST", cookie: tmp.cookie });
const afterLogout = await req("/api/admin/export", { cookie: tmp.cookie });
check("2.8b", "Session invalid server-side after logout", afterLogout.status === 401, `status ${afterLogout.status}`);
const viewerId = redis("GET admin:email:viewer@test.local").replace(/"/g, "");
await req(`/api/admin/accounts/${viewerId}`, { method: "PATCH", cookie: owner.cookie, body: { disabled: true } });
const disabled = await req("/api/admin/qr", { cookie: viewer.cookie });
check("2.8c", "Disabled account's existing session stops working", disabled.status === 401, `status ${disabled.status}`);

// ---------- IDOR / enumeration ----------
const rnd = await req("/thank-you/aaaaaaaaaaaa");
const rndIcs = await req("/api/ics/aaaaaaaaaaaa");
check("1.4f", "Unknown signup id reveals nothing (no recap; ics 404)", !rnd.text.includes("Your recap") && rndIcs.status === 404, `${rnd.status}/${rndIcs.status}`);

// ---------- login timing (user enumeration) ----------
async function timeLogin(email) { const t = performance.now(); await req("/api/admin/login", { method: "POST", body: { email, password: "definitely-wrong" } }); return performance.now() - t; }
const tk = [], tu = [];
for (let i = 0; i < 4; i++) { tk.push(await timeLogin("timing@test.local")); tu.push(await timeLogin(`ghost${i}@nowhere.test`)); }
const med = (a) => a.sort((x, y) => x - y)[Math.floor(a.length / 2)];
const ratio = med(tk) / Math.max(1, med(tu));
check("2.4a", "Login timing doesn't reveal which emails are accounts", ratio < 2, `known ${med(tk).toFixed(0)}ms vs unknown ${med(tu).toFixed(0)}ms`);

const fails = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - fails}/${results.length} passed`);
