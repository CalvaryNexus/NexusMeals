/**
 * The Nexus wordmark. The source asset is a white knockout, so it's applied as
 * a CSS mask and painted with `currentColor` — that lets the same file render
 * white on the navy hero and navy on the white nav bar without shipping two
 * images. Browsers without mask support fall back to a styled text wordmark.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Nexus"
      className={`logo-mark ${className}`}
      data-wordmark="NEXUS"
    />
  );
}
