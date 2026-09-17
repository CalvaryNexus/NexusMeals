import type { WeekColor, WeekComputedState } from "@/lib/types";

const COLOR_CLASSES: Record<WeekColor, string> = {
  default: "bg-card text-navy-text border border-card-line",
  need: "bg-[color:var(--need)]/10 text-[color:var(--need)] border border-[color:var(--need)]/30",
  warn: "bg-[color:var(--warn)]/10 text-[color:var(--warn)] border border-[color:var(--warn)]/30",
  ok: "bg-[color:var(--ok)]/10 text-[color:var(--ok)] border border-[color:var(--ok)]/30",
  "ink-soft": "bg-black/5 text-ink-soft border border-rule",
};

const STATE_LABELS: Record<WeekComputedState, string> = {
  open: "Open",
  urgent: "Urgent",
  covered: "Covered",
  no_nexus: "No Nexus",
  closed: "Closed",
};

export function WeekBadge({
  state,
  color,
  label,
}: {
  state: WeekComputedState;
  color: WeekColor;
  label?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${COLOR_CLASSES[color]}`}
    >
      {label ?? STATE_LABELS[state]}
    </span>
  );
}
