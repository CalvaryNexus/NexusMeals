// Test-only: stubs Cloudflare siteverify (token "pass" succeeds).
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input.url;
  if (url && url.startsWith("https://challenges.cloudflare.com/turnstile/v0/siteverify")) {
    const token = new URLSearchParams(String(init && init.body)).get("response");
    return new Response(JSON.stringify({ success: token === "pass" }), { status: 200, headers: { "content-type": "application/json" } });
  }
  return realFetch(input, init);
};
