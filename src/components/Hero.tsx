/**
 * The navy masthead every public page opens with.
 */
export function Hero({
  eyebrow,
  title,
  subtitle,
  children,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <header className="hero -mt-[var(--nav-h)] pt-[var(--nav-h)] text-white">
      <div
        className={`mx-auto max-w-[1140px] px-6 ${
          compact ? "py-8 sm:py-10" : "py-10 sm:py-16"
        }`}
      >
        {eyebrow && (
          <p
            className="eyebrow text-[color:#a9c0f2] enter-up"
            style={{ animationDelay: "60ms" }}
          >
            <span aria-hidden className="h-px w-6 bg-current opacity-60" />
            {eyebrow}
          </p>
        )}

        <h1
          className={`display mt-2 leading-[1.08] enter-up ${
            compact ? "text-2xl sm:text-4xl" : "text-3xl sm:text-5xl"
          }`}
          style={{ animationDelay: "120ms" }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="mt-3 max-w-[58ch] text-base text-white/85 enter-up sm:text-lg"
            style={{ animationDelay: "180ms" }}
          >
            {subtitle}
          </p>
        )}

        {children && (
          <div className="mt-7 enter-up" style={{ animationDelay: "240ms" }}>
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
