/**
 * Placeholder knockout wordmark. The brief calls for the white Nexus logo
 * embedded in the Abide Leader's Guide; swap this for that PNG at
 * /public/nexus-logo.png and render an <Image> instead once it's available.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-heading text-white tracking-wide uppercase ${className}`}
    >
      Nexus
    </span>
  );
}
