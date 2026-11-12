# Nexus Meals Security Report

Audit date: 2026-11-12. Scope: this repository (branch
`claude/nexusmeals-app-build-rl0vts`) and the live Vercel project
`nexus-meals` (`prj_mmHhrCrLQ2ud6W6W3lo0MAhoqd4T`, team CalvaryNexus).

**Summary.** No secret ever reached the client or git history, and
authorization holds on every admin route. I found and fixed these
issues:

- The cron purge endpoint was open to anyone in production.
- The volunteer CSV export allowed spreadsheet formula injection.
- Login timing revealed which emails had accounts.
- The accounts page sent every team member's password hash to the
  browser.
- Several validation gaps, including signups for arbitrary dates.
- A signup bug on weeks with an arrival-time override.
- One critical and three high dependency advisories.

Three changes are waiting on your approval: CSP nonces, a Vercel WAF
rate-limit rule, and an Origin check on admin writes. The biggest
remaining risk is cost: public page loads have no rate limit and no
spend cap is configured.

How to re-verify: `./scripts/security/run.sh` builds the app, runs it
locally against a throwaway Redis, and executes the 43 checks referenced
below as `[test X]`. Result at time of writing: **43/43 passed**. The same
suite against the pre-audit code: 24/39 passed. (The suite grew during the
audit.)

---

## Phase 0: Map

### 0.1 Direct access

| System | Inspected directly? | How |
| --- | --- | --- |
| Code + git history | Yes | Local clone, full history (17 commits) |
| Vercel project config | Yes | Vercel MCP: project, env var names/targets/types (values **not** decrypted), firewall, team members, integrations + billing, runtime errors, deployments |
| Live site behavior | Yes, partly | Vercel MCP fetch of `nexus-meals.vercel.app`. The sandbox's network proxy blocks direct `curl`, so the plain-HTTP redirect couldn't be tested from here |
| Upstash Redis | **No** | No Upstash MCP/CLI connected. Billing seen through Vercel only. Backups/budget unverified |
| Cloudflare Turnstile | **No** | Widget hostname list confirmed earlier via your screenshots only |
| securityheaders.com | **No** | Blocked by sandbox proxy |

### 0.2 Inventory

**Routes**

| Route | Kind | Who may call it |
| --- | --- | --- |
| `/`, `/schedule`, `/overview`, `/signup` | Pages | Public |
| `/thank-you/[id]` | Page | Anyone holding the 12-char random signup ID (capability link). Shows first name, meal, date |
| `/api/signup` POST | API | Public, gated by rate limit + honeypot + Turnstile |
| `/api/ics/[id]` GET | API | Anyone holding the signup ID |
| `/admin/login`, `/api/admin/login` POST | Page/API | Public (rate limited) |
| `/api/admin/logout` POST | API | Anyone (only clears the caller's own session) |
| `/admin`, `/admin/schedule`*, `/admin/signups/*` | Pages | Logged-in admin (owner or viewer). *`/admin/schedule` is owner-only |
| `/admin/overview`, `/admin/settings`, `/admin/volunteers`, `/admin/accounts` | Pages | Owner |
| `/api/admin/signups` POST, `/api/admin/signups/[id]` PATCH/DELETE, `/api/admin/needs-contact/[id]` DELETE, `/api/admin/qr` GET | API | Logged-in admin (any role) |
| `/api/admin/overview` PUT, `/api/admin/settings` PUT, `/api/admin/weeks/[date]` GET/PATCH, `/api/admin/export` GET, `/api/admin/accounts` POST, `/api/admin/accounts/[id]` PATCH/DELETE | API | Owner |
| `/api/cron/purge` GET | Cron | Vercel Cron only (Bearer `CRON_SECRET`) |

No server actions, webhooks, or file uploads exist.

**Data stores (Upstash Redis keys)**

| Key | Holds | Who can write each field |
| --- | --- | --- |
| `settings` | Address, contact, cutoff, window, retention | Owner, via schema-validated API |
| `overview` | Public page content, headcount | Owner (rich text sanitized on save and on render) |
| `week:{date}` | No-Nexus flag/label, arrival override | Owner |
| `claim:{date}` | Signup ID (the double-booking lock) | Server only (atomic `SET NX`) |
| `signup:{id}` | `name`, `email`, `phone`, `meal`, `date` | Public client via validated `/api/signup`, or any admin |
| | `reminderSent` | Any admin |
| | `id`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`, `purged` | **Server only** [test 1.3a, 1.3b] |
| `signups:by-date`, `needs-contact` | Indexes | Server (admin actions trigger) |
| `admin:{id}` | `email`, `role`, `passwordHash` | Owner (create only) |
| | `disabled` | Owner (not on self) |
| | `id`, `createdAt` | Server |
| `admin:email:{email}`, `session:{token}` | Lookups / sessions (7-day TTL) | Server only |
| `ratelimit:*` | Rate-limit windows (keyed by IP or email) | Server only (`@upstash/ratelimit`) |
| `export-log` | Who exported CSV, when, row count | Server only |

**Third-party services**

| Service | Called from | Credential | Costs money? |
| --- | --- | --- | --- |
| Upstash Redis | Server only (`src/lib/redis.ts`) | `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Yes, per command (pay-as-you-go via Vercel Marketplace; $0.00 so far this month) |
| Cloudflare Turnstile | Widget in browser; verification server-side (`src/lib/turnstile.ts:9`) | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (public), `TURNSTILE_SECRET_KEY` | No |
| Vercel hosting + Cron | n/a | n/a | Yes (Pro plan, usage-based overages) |
| Google Calendar | Plain link the browser navigates to; no API call | None | No |
| Google Fonts | Self-hosted at build by `next/font`; no runtime call | None | No |

No AI, email/SMS, payment, or storage-write services.

**Secrets / env vars (production + preview)**

| Var | Client-exposed? | Grants | Notes |
| --- | --- | --- | --- |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | No | Full read/write to the DB, including all PII | In use |
| `KV_REST_API_READ_ONLY_TOKEN`, `KV_URL`, `REDIS_URL` | No | Read-only / full TCP access | Injected by integration; **unused** |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | No | (blank) | Stale import from `.env.example`; delete |
| `TURNSTILE_SECRET_KEY` | No | Turnstile verification | In use |
| `TURNSTILE_SITE_KEY` | No | Nothing (public value) | **Unused**; delete |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | **Yes, by design** | Public widget key | Correct (production only) |
| `OWNER_EMAIL` / `OWNER_PASSWORD` | No | Seeds an owner login when no admins exist | In use |
| `CRON_SECRET` | No | Triggers the purge | **Blank in production**. See CRON below |
| `SESSION_SECRET` | No | Nothing | **Unused** (sessions are random Redis tokens); delete |
| `NEXT_PUBLIC_BASE_URL` | Yes (not a secret) | n/a | Likely blank or `localhost` from the template |

All values are Vercel "sensitive" (write-only). I never decrypted them; the
"blank" conclusions come from creation timestamps matching the
`.env.example` import, plus live behavior (cron answered without a secret).

**Personal data**

| Field | Why needed | Retention | Minors? |
| --- | --- | --- | --- |
| Volunteer name, email, phone | Coordinate the meal, send reminders | Wiped 30 days after the Sunday (purge job) | No: volunteers are adults. No student data is stored |
| Meal + date | Schedule history | Indefinite | Not PII |
| Admin emails | Team logins | Until account deleted | No |
| Client IP | Rate limiting | Expires with the window (≤10 min) | n/a |
| Dietary-needs labels/counts | Public overview page | Until edited | Owner-entered; **keep labels non-identifying** (no student names), since they're public |

---

## Phase 1: Critical

### 1.1. Secrets never reach the client
Status: PASS
Found: No server secret in client code. `.env*` gitignored (except the template). Only `.env.example` was ever committed.
Changed: `.env.example` rewritten. It now carries a warning not to bulk-import it into Vercel and drops unused vars. Its earlier import is what left blank values in production.
Verified: Built with unique marker values in every secret. `grep -r MARKER_SRV_ .next/static public` returned nothing, and no `.map` files ship. Full-history scan (`git log --all -p`, lockfile excluded) for Upstash/Turnstile/Stripe/GitHub/private-key/redis-URL/bcrypt patterns found nothing. Live `/schedule` payload contains no emails except the public contact address and no phones or record fields.
Open items: none.

### 1.2. Sensitive third-party calls happen on the server only
Status: PASS
Found: Redis and Turnstile verification are server-only (see inventory). No payments.
Changed: Turnstile verification now has an 8 s timeout and treats network errors as failure (`src/lib/turnstile.ts`).
Verified: The client bundle doesn't import `@/lib/redis`, `signups`, `auth`, `settings`, or `session` (grep across `"use client"` files returned nothing).
Open items: **Least privilege.** The Upstash integration injects `KV_URL`, `REDIS_URL`, and a read-only token the app never uses, into both Production and Preview. **Preview deployments share the production database and its PII.** See manual actions.

### 1.3. Privileged fields can't be written by users
Status: FIXED
Found: Schemas already stripped unknown keys, so no mass assignment. But an owner could disable their own account, and if they were the only owner that is an unrecoverable lockout.
Changed: `src/app/api/admin/accounts/[id]/route.ts` blocks self-disable, matching the existing self-delete block. Since only an active owner can call it, at least one active owner always remains.
Verified:
- [1.3a] Public signup with `createdBy/reminderSent/purged/id` injected: all ignored.
- [1.3b] Admin PATCH with `purged/createdBy/date/id`: ignored.
- [1.3c] Viewer creating an owner account: 403.
- [1.3d] Viewer editing account records: 403.
- [1.3e] Owner self-disable: 400.

Open items: none. (No Supabase/Firebase, so no RLS.)

### 1.4. Server-side authorization on every request
Status: PASS
Found: Every admin API checks the session and role from Redis before reading or writing. Pages redirect. Disabled and deleted accounts lose access immediately.
Changed: none.
Verified:
- [1.4a] Logged-out: 401 on all 13 admin API route/method pairs.
- [1.4b] Viewer: 403 on every owner-only API.
- [1.4c] Forged token: 401.
- [1.4d] Logged-out admin pages redirect to login.
- [1.4e] Viewer loading `/admin/accounts` receives no other admins' data.
- [1.4f] Unknown signup ID reveals nothing.
- [2.8c] Disabled account's live session: 401.

Open items: Owner-only pages that bail out render as a 200 with an in-page redirect and a not-found as a soft 404. That's a side effect of streaming. No data leaks (tests 1.4e/1.4f), so it's cosmetic only. Signup IDs are 12-char random capability links (~71 bits), not guessable.

### 1.5. Rate limits and cost controls
Status: FIXED (two items need your approval)
Found: Upstash rate limits on signup (per IP) and login (per IP and per account), but 429s carried no `Retry-After`. Signup was capped at 5 per 10 min per IP, which could block a room of families on shared church Wi-Fi. Page loads and admin APIs had no limits.
Changed: `src/lib/ratelimit.ts` adds a shared `tooManyRequests()` that sends `Retry-After`. The signup per-IP limit is now 10 / 10 min; Turnstile remains the main bot gate.
Verified:
- [1.5c] 11th signup from one IP: 429.
- [1.5d] With `Retry-After: 516`.
- [1.5e] 11th login from one IP: 429.
- [1.5f] 6th login to one account from rotating IPs: 429.
- [1.5g] Login 429 carries `Retry-After`.
- [1.5a/b] Bad Turnstile token and filled honeypot are rejected.

Open items: **NEEDS APPROVAL B** (Vercel WAF rate limit on page loads). Admin APIs are unthrottled but require a session; I'm accepting that. The per-account login limit means anyone who knows the owner's email can lock them out for 10 minutes. That's the standard tradeoff, and I'm accepting it.

### 1.6. Manual billing safeguards
Status: N/A in code. See "Manual actions for Tanner" #3–#5.

---

## Phase 2: Hardening

### 2.1. HTTPS everywhere
Status: PASS
Found: Live responses send `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (fetched via Vercel MCP). No hardcoded `http://` URLs in `src`. Vercel forces HTTPS on `*.vercel.app`.
Changed: none.
Verified: Header captured from live `/api/cron/purge` and `/schedule` responses. Grep for `http://` returned only the SVG namespace.
Open items: Run `curl -I http://nexus-meals.vercel.app` yourself; the sandbox can't reach it.

### 2.2. Input validation and injection prevention
Status: FIXED
Found: Zod on every endpoint, but with these gaps:
- Signups were accepted for **any date**, including a Wednesday in 2031 and `2026-13-45`, creating junk claims outside the schedule.
- The phone check only counted digits, so a 10,000-character string containing 10 digits passed.
- The week-date URL parameter flowed unchecked into a Redis key name.
- Login password and Turnstile token had no max length.
- **CSV export allowed formula injection**: a volunteer could enter `=HYPERLINK(...)` as their name and it would run when the owner opened the file.

Changed:
- `src/lib/validation.ts`: real-calendar-date check, phone max 32 and an allowed-character list, max lengths on login and token.
- `src/lib/weeks.ts`: new `getRequestedWeekState`. Writes must target a Sunday currently on the schedule. Used by `src/app/api/signup/route.ts` and `src/app/api/admin/signups/route.ts`.
- `src/app/api/admin/weeks/[date]/route.ts`: rejects anything but a real Sunday.
- `src/lib/csv.ts`: prefixes `= + - @ tab CR` cells with `'`.

Verified:
- [2.2a/b] Out-of-window and impossible dates: 400.
- [2.2c] 10k phone: 400.
- [2.2d] `<script>`, `' OR 1=1 --`, a 10k string, emoji, wrong types, Mongo-style `{"$gt":""}`, missing fields, a 100k token, and non-JSON: zero 500s.
- [2.2e] Stored `<script>` renders escaped.
- [2.2f] `../../admin` week key: 400.
- [2.2g] 200k-char password: 400.
- [2.2h] Exported CSV cell starts with `'=HYPERLINK`.

Redis commands are JSON arrays over REST, so there is no command injection. The two `dangerouslySetInnerHTML` sinks (`src/app/(public)/overview/page.tsx:228,309`) both pass through `sanitize-html`. The rich-text editor only loads already-sanitized owner content.
Open items: none.

### 2.3. No sensitive data in browser storage
Status: FIXED
Found: No localStorage, sessionStorage, IndexedDB, or readable cookies. But **`/admin/accounts` serialized every team member's bcrypt password hash into the page sent to the owner's browser.**
Changed: `src/app/admin/(dashboard)/accounts/page.tsx` passes only `id, email, role, disabled, createdAt`. New `AdminSummary` type in `src/lib/types.ts` enforces it in `AccountsPanel.tsx`.
Verified: [2.3a] Owner's accounts page contains no `$2b$` or `passwordHash`. The same test **fails on the pre-fix code** (run during the audit).
Open items: none.

### 2.4. Authentication
Status: FIXED
Found: bcrypt cost 12 and random 32-char session tokens stored in Redis. But login skipped bcrypt for unknown or disabled emails: **364 ms vs 13 ms**, which reveals which emails are accounts.
Changed: `src/lib/auth.ts` adds `authenticate()`, which always runs one bcrypt comparison against a fixed dummy hash when there's no usable account. `src/app/api/admin/login/route.ts` uses it.
Verified: [2.4a] Median 373 ms (real account) vs 379 ms (unknown email).
Open items: Sessions are custom (random token in Redis, TTL 7 days, deleted on logout). That's simple and verified [2.8b], but it isn't a library. There's no in-app password change (see open risks).

### 2.5. CSRF
Status: PASS (defense in depth: NEEDS APPROVAL C)
Found: The session cookie is `SameSite=Lax`, so browsers don't send it on cross-site POST/PATCH/DELETE. `vercel.app` is on the Public Suffix List, so other `*.vercel.app` sites count as cross-site. All state changes are POST/PATCH/PUT/DELETE except two:
- The cron route, now secret-gated.
- `GET /api/admin/export`, which appends an audit-log entry. A cross-site link could make a logged-in owner download their own CSV, but the attacker can't read the file.

Changed: none.
Verified: Cookie attributes [2.8a]. curl can't emulate browser SameSite behavior, so the cross-origin POST test is by attribute evidence only.
Open items: Approval C (Origin check).

### 2.6. API exposure and CORS
Status: PASS
Found: No CORS headers anywhere.
Verified: [2.6] Authenticated API called with `Origin: https://evil.example` returns no `Access-Control-Allow-Origin`.
Open items: none.

### 2.7. Security headers
Status: FIXED (CSP tightening: NEEDS APPROVAL A)
Found: CSP (enforced), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, and HSTS were live. `X-Powered-By: Next.js` was sent; there was no `Permissions-Policy`.
Changed: `next.config.ts` adds `poweredByHeader: false` and `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()`.
Verified: [2.7a–c] all present or absent as expected on the local production build.
Open items: CSP `script-src` still allows `'unsafe-inline'` (approval A). securityheaders.com grade not recorded (blocked from the sandbox); please run it after deploy.

### 2.8. Secure cookies
Status: PASS
Found and verified: The only cookie is `nexus_session`: `HttpOnly; Secure; SameSite=lax; Path=/; Max-Age=604800` [2.8a]. It's deleted server-side on logout [2.8b] and dead immediately on account disable [2.8c].
Open items: none.

### 2.9. Errors and logging
Status: PASS
Found: No `console.*` in `src`. The public error boundary shows a generic message. API errors return fixed strings. Production 500s are Next's generic page. No browser source maps. Vercel shows **zero runtime errors in the last 7 days**.
Changed: Removed the `X-Powered-By` version hint (see 2.7).
Open items: none.

### 2.10. File uploads
Status: N/A. There are no uploads. The logo is a static file in the repo.

### 2.11. Dependencies and supply chain
Status: FIXED
Found: `npm audit` reported 14 issues (1 critical, 3 high, 9 moderate, 1 low):
- **critical** `next` 16.3.5: RCE in `next/og`, plus a `use cache` leak. Neither feature is used here.
- **high** `zod`: memory exhaustion.
- **high** `sharp` and `source-map-js` (transitive).
- **moderate** `sanitize-html`: a sanitizer bypass. This one matters, since the app relies on it.
- `react-hook-form` was installed but unused.

Changed:
- `next` 16.3.5 → 16.4.6 (and `eslint-config-next`).
- `zod` → 4.6.7, `sanitize-html` → 2.18.2.
- `npm audit fix` for the transitive ones.
- Removed `react-hook-form`.

All are minor or patch versions; no major upgrades.
Verified: `npm audit` now shows 0 critical, 0 high, 8 moderate. All 8 are dev-only ESLint tooling (`minimatch` regex DoS), never shipped; npm's only "fix" is a downgrade. Lockfile is committed. All 10 runtime deps resolve to their expected upstream repos (marsidev, upstash ×2, dcodeIO, marnusw, adamgibbons, ai/nanoid, soldair, apostrophecms, colinhacks). Download counts couldn't be fetched from the sandbox, but none are obscure. The test-only `ioredis` (redis/ioredis) installs with `--no-save` and isn't a project dependency.
Open items: Enable Dependabot (manual action #9).

### 2.12. AI feature safety
Status: N/A. The app calls no LLM.

### 2.13. Platform protection and backups
Status: NEEDS APPROVAL B / manual
Found:
- Vercel Firewall has **no custom config**: platform DDoS mitigation only, with no active anomalies.
- Deployment Protection: Vercel Authentication on all deployments except custom domains. Preview URLs require a Vercel login, which is good.
- One team member (you, Owner).
- Backups: Upstash backup status and restore testing couldn't be inspected.

Open items: Approval B. Manual actions #6 and #7.

### CRON. Purge endpoint (finding outside the checklist)
Status: FIXED
Found: **Live production `/api/cron/purge` returned 200 to an unauthenticated request.** The code skipped the check whenever `CRON_SECRET` was blank, and in production it is blank. Impact was low: the job only wipes PII already past retention, and it's idempotent. But it was an open endpoint.
Changed: `src/app/api/cron/purge/route.ts` fails closed when the secret is unset and compares in constant time.
Verified:
- [CRON] Local build, no header: 401.
- Wrong secret: 401.
- Correct secret: 200.
- With `CRON_SECRET` blank, both no header and `Bearer `: 401.

Open items: **After this deploys, the daily purge will refuse to run until you set `CRON_SECRET`** (manual action #1).

### BUG-1. Weeks with an arrival-time override rejected every signup
Status: FIXED
Found: The schedule display treated only `status: "no_nexus"` as off-schedule. The public and admin signup APIs treated *any* override (including just a new arrival time) as No Nexus. Result: those weeks showed as Open but every signup failed with "no longer available".
Changed: Both APIs now use `getRequestedWeekState` (see 2.2).
Verified: [BUG-1] Week with only an arrival override accepts a signup (400 before, 200 after).

### Also fixed: QR code target
`NEXT_PUBLIC_BASE_URL` is likely blank or `localhost` in production, so the admin QR code probably encoded an unusable URL. `src/app/api/admin/qr/route.ts` now uses the configured value only if it's `https://`, and otherwise the request's own origin.

---

## Phase 3: Attack results

Run against a local production build (`next start`) with a throwaway Redis. Nothing was attempted against production except read-only fetches and one call to the already-open purge endpoint, which purged 0 records.

| # | Scenario | Result |
| --- | --- | --- |
| 1 | Give myself admin, owner, or approval | **Blocked.** No self-registration. Account creation/edit is owner-only [1.3c, 1.3d, 1.4b]. Role comes from the server-side admin record |
| 2 | Raise or reset my rate limit | **Blocked.** Counters live in Redis under server-only keys. On Vercel the client IP comes from `x-forwarded-for`, which Vercel overwrites, so it can't be spoofed. The suite spoofs it locally on purpose to simulate many IPs |
| 3 | Read/edit/delete others' data by ID | **Blocked for the public.** No public user accounts. Signup IDs are 71-bit random capability links [1.4f]. Any admin can edit any signup, which is by design (team tool) |
| 4 | Dump a table or keyspace | **Blocked.** No list endpoint for the public. Redis tokens are server-only (1.1) |
| 5 | Protected content logged out | **Blocked** [1.4a, 1.4d] |
| 6 | Make you pay via AI, email, SMS, or payments | **N/A.** None exist. Cheapest abuse is page loads; see cost math |
| 7 | Find a working key in source, bundle, network, or errors | **None found** (1.1). Only the public Turnstile site key is visible, by design |
| 8 | Many accounts / brute force / spam the form | **Throttled.** No public accounts. Login: 10/10 min per IP and 5/10 min per account against bcrypt-12 hashes. Form: Turnstile, honeypot, 10/10 min per IP. Residual risk: someone who solves Turnstile can squat open Sundays with fake names, at a pace of one week each. Admins can remove them (open risk 5) |
| 9 | AI prompt injection | **N/A** |
| 10 | Malicious or huge upload | **N/A** |
| 11 | Forged webhook or cron call | **Was open in production; now blocked** [CRON] |
| 12 | Cost worst case | See below |

**Cost worst case (cheapest endpoint: `GET /schedule` or `/signup`).** No login, no Turnstile, no rate limit. Measured on the local build:
- **6 Redis commands** and about **9.5 KB** compressed per request.
- A rejected signup costs 2 commands, even after the IP is blocked.

Assumed list prices (verify current pricing):
- Upstash pay-as-you-go: $0.20 per 100K commands.
- Vercel Pro: $0.60 per 1M function invocations over the included 1M, and about $0.128 per active-CPU-hour.
- Transfer: within the included 1 TB.

| Sustained attack | Requests / 24 h | Upstash | Vercel invocations | Vercel CPU (~20 ms each) | ≈ per day |
| --- | --- | --- | --- | --- | --- |
| 50 req/s (one script) | 4.32 M | 25.9 M cmds → **$52** | ~$2 | ~$3 | **~$57/day** |
| 500 req/s (small botnet) | 43.2 M | 259 M cmds → **$518** | ~$25 | ~$31 | **~$575/day** (~$17K/month) |

There is no spend cap today, so nothing stops this except Vercel's automatic DDoS mitigation, which may not trip on a slow, distributed attack. Fixes: approval B (WAF rate limit) and manual actions #3–#4 (hard caps).

**Flow traces (click → client → server → DB → response)**

1. **Public signup.** Form (client) → `POST /api/signup` → per-IP rate limit → JSON parse + honeypot → Zod with max lengths → Turnstile siteverify (server) → week must be on the schedule, not No Nexus, and before cutoff → atomic `SET NX` claim → server writes the record with `createdBy=public` → response returns `{id}` only. Every hop is protected.
2. **Admin login.** Form → `POST /api/admin/login` → per-IP limit → Zod → per-account limit → constant-time `authenticate()` (bcrypt) → disabled check → random token stored in Redis (7-day TTL) → `HttpOnly; Secure; SameSite=Lax` cookie. Every hop is protected.
3. **Volunteer PII export.** Owner clicks Export → `GET /api/admin/export` with cookie → `requireOwnerApi` (session → admin record → role, all from Redis) → past, non-purged signups → formula-neutralized CSV → audit-log entry → attachment download. **Weak hop:** it's a GET with a state change (the audit-log write) and relies on `SameSite=Lax` alone for CSRF. Impact is limited to an extra log line, since the file goes to the owner's own browser.

---

## Needs approval

These could break production if done wrong, so I haven't made them.

- **A. Nonce-based CSP.** Replace `script-src 'unsafe-inline'` with a per-request nonce (generated in Next's request proxy) and add `object-src 'none'`. Run it as `Content-Security-Policy-Report-Only` for a week first, then enforce. Risk: a missed inline script breaks hydration or Turnstile, so the report-only phase catches that.
- **B. Vercel WAF rate-limit rule.** For example, log-only first, then deny at about 300 requests/min per IP on `/`, `/schedule`, `/overview`, `/signup`, `/thank-you/*`. That's far above what a person or a church room generates. I can apply it through the Vercel connector once you OK the numbers.
- **C. Origin check on `/api/admin/*` writes.** Reject POST/PATCH/PUT/DELETE whose `Origin` isn't the site's own. Defense in depth on top of `SameSite=Lax`.

## Keys to rotate

None. No secret was found in the repo, git history, client bundle, logs, or this conversation. The Turnstile *site* key that appeared in chat is public by design. Env values were never decrypted during this audit.

## Manual actions for Tanner

1. **Set `CRON_SECRET` now (urgent).** In Vercel → Settings → Environment Variables, edit `CRON_SECRET` (Production + Preview). Give it a long random value generated on your own machine (for example `openssl rand -hex 32`); never paste it into chat. Then redeploy. Until then the daily PII purge won't run.
2. **Clean up env vars.** Delete `SESSION_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and `TURNSTILE_SITE_KEY`, all unused or blank. Set `NEXT_PUBLIC_BASE_URL` to `https://nexus-meals.vercel.app`, or delete it.
3. **Vercel Spend Management (hard cap).** Team Settings → Billing → Spend Management: set a monthly amount and turn on pausing production deployments when it's reached. A short outage beats a surprise bill.
4. **Upstash budget.** Upstash console → database `upstash-kv-bistre-pillar` (ID `12143ba5…`) → set a monthly budget or limit if offered for this Marketplace-billed database. At minimum, turn on spend alerts.
5. **Cloudflare Turnstile.** Free, no cap needed. Keep the hostname list to `nexus-meals.vercel.app` (plus any custom domain you add).
6. **Separate database for Preview.** Create a second Upstash DB and scope its vars to Preview only, so branch deployments can't touch real volunteer data.
7. **Backups.** In the Upstash console, confirm daily backups are on for this DB, and do one test restore into a scratch DB. Vercel rollback only covers code.
8. **Unused integrations.** The team has Neon (free) and a second "redis" Marketplace integration installed, neither used by this project. Remove them if nothing else needs them.
9. **Dependabot.** GitHub repo → Settings → Code security → enable Dependabot alerts and security updates.
10. **Owner password.** Make sure `OWNER_PASSWORD`, which is your actual login, is 16+ random characters. To rotate it: create a new owner account, sign in with it, then delete the old one.
11. **After deploy:** run `curl -I http://nexus-meals.vercel.app` (expect a redirect to https) and check securityheaders.com.

## Open risks (highest first)

1. **Unthrottled public page loads → cost** (~$57–575/day under attack, no cap). Fix: approval B plus manual actions #3–#4.
2. **PII purge paused until `CRON_SECRET` is set.** Fix: manual action #1.
3. **Preview deployments read and write the production database and PII.** Fix: manual action #6.
4. **CSP allows inline scripts**, so any future XSS sink would be exploitable. No sink exists today. Fix: approval A.
5. **Slot squatting.** Someone who passes Turnstile can claim open Sundays with fake data. Admins can remove them. Possible follow-up: one active signup per email or phone.
6. **No in-app password change or "log out everywhere".** Rotation works via a new owner account (manual action #10).
7. **Per-account login limit allows a 10-minute lockout** of a known email. Accepted tradeoff.
8. **GET export writes an audit entry; admin writes rely on SameSite alone.** Fix: approval C.
9. **8 moderate dev-only advisories** in ESLint tooling. Revisit when `eslint-config-next` updates.
