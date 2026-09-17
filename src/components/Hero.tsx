import { Logo } from "./Logo";

export function Hero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="hero-stripes rounded-b-none sm:rounded-b-[12px]">
      <div className="mx-auto max-w-[1140px] px-6 py-10 sm:py-14">
        <Logo />
        {eyebrow && (
          <p className="mt-4 text-navy-stripe/90 uppercase tracking-widest text-xs sm:text-sm font-semibold text-[color:#a9c0f2]">
            {eyebrow}
          </p>
        )}
        <h1 className="font-heading text-white text-3xl sm:text-5xl mt-2 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/90 mt-3 max-w-prose text-base sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
