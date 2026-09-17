import { Redis } from "@upstash/redis";

// Vercel's Upstash marketplace integration has injected different env var
// names over time (native `UPSTASH_REDIS_REST_*`, or the older Vercel KV
// naming `KV_REST_API_*`). Accept whichever pair is present so a fresh
// Storage-tab connection works without renaming anything by hand.
// Falls back on blank values too (not just unset), since a leftover empty
// variable from an earlier setup attempt would otherwise block the fallback.
const url =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  throw new Error(
    "Missing Upstash Redis credentials. Set UPSTASH_REDIS_REST_URL and " +
      "UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_URL / KV_REST_API_TOKEN if " +
      "connected via Vercel's Upstash integration) in your environment.",
  );
}

export const redis = new Redis({ url, token });
