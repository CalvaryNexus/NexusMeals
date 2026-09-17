export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display text-2xl text-navy-text">{title}</h1>
        {description && (
          <p className="mt-1 max-w-prose text-sm text-ink-soft">{description}</p>
        )}
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}

export function StatTile({
  value,
  label,
  tone = "default",
  icon,
}: {
  value: string | number;
  label: string;
  tone?: "default" | "ok" | "warn" | "need";
  icon?: React.ReactNode;
}) {
  const TONES = {
    default: "text-navy-text bg-card",
    ok: "text-[color:var(--ok)] bg-[color:var(--ok)]/10",
    warn: "text-[color:var(--warn)] bg-[color:var(--warn)]/10",
    need: "text-[color:var(--need)] bg-[color:var(--need)]/10",
  } as const;

  return (
    <div className="panel flex items-center gap-4 p-4">
      {icon && (
        <span
          className={`flex h-10 w-10 flex-none items-center justify-center rounded-[12px] ${TONES[tone]}`}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="display text-2xl leading-none text-navy-text">{value}</p>
        <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
          {label}
        </p>
      </div>
    </div>
  );
}
