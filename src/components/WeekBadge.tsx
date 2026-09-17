import type { WeekColor, WeekComputedState } from "@/lib/types";

const COLOR_CLASSES: Record<WeekColor, string> = {
  default:
    "bg-card text-navy-text border border-card-line",
  need: "bg-[color:var(--need)]/8 text-[color:var(--need)] border border-[color:var(--need)]/25",
  warn: "bg-[color:var(--warn)]/10 text-[color:var(--warn)] border border-[color:var(--warn)]/25",
  ok: "bg-[color:var(--ok)]/8 text-[color:var(--ok)] border border-[color:var(--ok)]/25",
  "ink-soft": "bg-paper-sunk text-ink-soft border border-rule",
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
  className = "",
}: {
  state: WeekComputedState;
  color: WeekColor;
  label?: string;
  className?: string;
}) {
  // A gently pulsing dot on the weeks that still need someone, nothing else.
  const live = color === "need" && state !== "closed";
  // An open week inside the red window is the one that actually needs action,
  // so it says so rather than sitting there as an alarming "Open".
  const text =
    label ?? (live && state === "open" ? "Needs a meal" : STATE_LABELS[state]);

  return (
    <span className={`badge ${COLOR_CLASSES[color]} ${className}`}>
      <span
        aria-hidden
        className={`badge-dot ${live ? "badge-dot-live" : ""}`}
      />
      {text}
    </span>
  );
}
