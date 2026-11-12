// Minimal Upstash REST -> local redis-server shim, for local testing only.
// Strips the Lua shebang flags that older local Redis versions reject.
import http from "node:http";
import Redis from "ioredis";

const redis = new Redis({ port: 6379 });
const TOKEN = process.env.SHIM_TOKEN || "local-test-token";
let commandCount = 0;

function enc(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return v;
  if (Array.isArray(v)) return v.map(enc);
  const s = String(v);
  if (s === "OK") return "OK";
  return Buffer.from(s, "utf8").toString("base64");
}

async function run(cmd) {
  commandCount++;
  try {
    const [name, ...args] = cmd.map(String);
    if (name.toUpperCase() === "EVAL") args[0] = args[0].replace(/^#!lua[^\n]*\n/, "");
    const r = await redis.call(name, ...args);
    return { result: enc(r) };
  } catch (e) {
    return { error: String(e.message || e) };
  }
}

http
  .createServer((req, res) => {
    if (req.url === "/__count") {
      res.end(JSON.stringify({ commandCount }));
      return;
    }
    if (req.headers.authorization !== `Bearer ${TOKEN}`) {
      res.writeHead(401, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      const parsed = JSON.parse(body || "null");
      const path = req.url.replace(/\/+$/, "");
      let out;
      if (path === "/pipeline" || path === "/multi-exec") {
        out = [];
        for (const c of parsed) out.push(await run(c));
      } else {
        out = await run(parsed);
      }
      const isErr = !Array.isArray(out) && out.error;
      res.writeHead(isErr ? 400 : 200, { "content-type": "application/json" });
      res.end(JSON.stringify(out));
    });
  })
  .listen(8079, () => console.log("shim on 8079"));
