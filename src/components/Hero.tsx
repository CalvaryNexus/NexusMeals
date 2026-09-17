/**
 * The navy masthead every public page opens with. The `stats` slot carries a
 * short row of at-a-glance facts so the hero does real work instead of just
 * taking up space.
 */
export function Hero({
  eyebrow,
  title,
  subtitle,
  stats,
  children,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  stats?: { value: string; label: string }[];
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

        {stats && stats.length > 0 && (
          <dl
            className="mt-7 flex flex-wrap gap-x-7 gap-y-4 enter-up sm:gap-x-9"
            style={{ animationDelay: "240ms" }}
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="display block text-2xl text-white sm:text-3xl">
                    {stat.value}
                  </span>
                  <span className="mt-0.5 block text-xs font-semibold uppercase tracking-[0.1em] text-white/60">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        )}

        {children && (
          <div className="mt-7 enter-up" style={{ animationDelay: "300ms" }}>
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
