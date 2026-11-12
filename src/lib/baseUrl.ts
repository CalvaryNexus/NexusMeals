/**
 * Resolves the site's public origin.
 *
 * `NEXT_PUBLIC_BASE_URL` is read in two places that both break badly when it
 * is missing or malformed: `metadataBase` (a bad value throws `Invalid URL`
 * and fails the whole build) and the admin QR code (an empty value silently
 * encodes a relative path, producing a QR that scans to nothing). Neither
 * should depend on the variable being filled in correctly, so everything
 * funnels through here.
 */

const LOCAL_FALLBACK = "http://localhost:3000";

function toUrl(value: string): URL | null {
  // Accept "example.com" as readily as "https://example.com".
  for (const candidate of [value, `https://${value}`]) {
    try {
      return new URL(candidate);
    } catch {
      // try the next shape
    }
  }
  return null;
}

export function getBaseUrl(): URL {
  const candidates = [
    process.env.NEXT_PUBLIC_BASE_URL,
    // Vercel sets these itself, so a deploy still resolves correctly even if
    // nobody configured the variable.
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    LOCAL_FALLBACK,
  ];

  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (!trimmed) continue;
    const url = toUrl(trimmed);
    if (url) return url;
  }

  return new URL(LOCAL_FALLBACK);
}

/** The origin with no trailing slash, for building links by hand. */
export function getBaseOrigin(): string {
  return getBaseUrl().origin;
}
