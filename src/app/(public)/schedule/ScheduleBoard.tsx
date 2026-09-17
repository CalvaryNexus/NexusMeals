"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { WeekBadge } from "@/components/WeekBadge";
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  MailIcon,
  MoonIcon,
  PhoneIcon,
  UtensilsIcon,
} from "@/components/Icons";
import type { WeekColor, WeekComputedState } from "@/lib/types";

export interface WeekCard {
  date: string;
  state: WeekComputedState;
  color: WeekColor;
  label?: string;
  meal?: string;
  arrivalLabel: string;
  dateLong: string;
  dateMedium: string;
  monthShort: string;
  dayOfMonth: string;
  monthYear: string;
  relative: string;
}

type Filter = "all" | "open" | "covered";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All Sundays" },
  { value: "open", label: "Needs a meal" },
  { value: "covered", label: "Covered" },
];

function isOpen(week: WeekCard) {
  return week.state === "open" || week.state === "urgent";
}

/**
 * The public schedule. Every week is already on the client, so filtering is
 * instant local state rather than a round trip — the list re-flows the moment
 * a chip is tapped.
 */
export function ScheduleBoard({
  weeks,
  contactEmail,
  contactPhone,
}: {
  weeks: WeekCard[];
  contactEmail: string;
  contactPhone: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(
    () => ({
      all: weeks.length,
      open: weeks.filter(isOpen).length,
      covered: weeks.filter((w) => w.state === "covered").length,
    }),
    [weeks],
  );

  const visible = useMemo(() => {
    if (filter === "open") return weeks.filter(isOpen);
    if (filter === "covered") return weeks.filter((w) => w.state === "covered");
    return weeks;
  }, [weeks, filter]);

  // Group into months so a long window reads as a calendar, not a wall of rows.
  const groups = useMemo(() => {
    const out: { month: string; weeks: WeekCard[] }[] = [];
    for (const week of visible) {
      const last = out[out.length - 1];
      if (last && last.month === week.monthYear) last.weeks.push(week);
      else out.push({ month: week.monthYear, weeks: [week] });
    }
    return out;
  }, [visible]);

  return (
    <div>
      <div
        role="group"
        aria-label="Filter Sundays"
        className="flex flex-wrap gap-2"
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className="chip"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                filter === f.value
                  ? "bg-white/20 text-white"
                  : "bg-paper-sunk text-ink-faint"
              }`}
            >
              {counts[f.value]}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="mt-8 rounded-[18px] border border-dashed border-card-line bg-paper-sunk px-6 py-14 text-center enter-fade">
          <p className="display text-lg text-navy-text">
            Nothing here right now
          </p>
          <p className="mt-1.5 text-sm text-ink-soft">
            {filter === "open"
              ? "Every Sunday in the window is spoken for. Thank you!"
              : "No Sundays have been claimed in this window yet."}
          </p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="btn btn-secondary btn-sm mt-5"
          >
            Show all Sundays
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {groups.map((group, gi) => (
            <section key={group.month}>
              <h2 className="sticky top-[var(--nav-h)] z-10 -mx-6 bg-paper/85 px-6 py-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-faint backdrop-blur-sm">
                {group.month}
              </h2>
              <ul className="mt-3 grid gap-4 sm:grid-cols-2">
                {group.weeks.map((week, i) => (
                  <WeekCardItem
                    key={week.date}
                    week={week}
                    delay={Math.min(gi * 40 + i * 45, 400)}
                    contactEmail={contactEmail}
                    contactPhone={contactPhone}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

const EDGE: Record<WeekColor, string> = {
  need: "edge-need",
  warn: "edge-warn",
  ok: "edge-ok",
  default: "edge-muted",
  "ink-soft": "edge-muted",
};

function WeekCardItem({
  week,
  delay,
  contactEmail,
  contactPhone,
}: {
  week: WeekCard;
  delay: number;
  contactEmail: string;
  contactPhone: string;
}) {
  const open = isOpen(week);
  const quiet = week.state === "no_nexus";

  return (
    <li
      className={`card ${EDGE[week.color]} ${
        open ? "card-interactive" : ""
      } ${quiet ? "opacity-75" : ""} overflow-hidden p-5 enter-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-[210px] flex-1 items-start gap-3.5">
          {/* Stacked date block reads faster than a full sentence of date. */}
          <div
            aria-hidden
            className="flex h-[52px] w-[52px] flex-none flex-col items-center justify-center rounded-[12px] border border-card-line bg-card leading-none"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-navy-stripe">
              {week.monthShort}
            </span>
            <span className="display mt-0.5 text-xl text-navy-text">
              {week.dayOfMonth}
            </span>
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-ink">{week.dateMedium}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-ink-soft">
              <span className="font-semibold text-navy-stripe">
                {week.relative}
              </span>
              {!quiet && (
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <ClockIcon className="h-3.5 w-3.5" />
                  Arrive by {week.arrivalLabel}
                </span>
              )}
            </p>
          </div>
        </div>

        <WeekBadge state={week.state} color={week.color} className="flex-none" />
      </div>

      <div className="mt-4">
        {open && (
          <Link
            href={`/overview?date=${week.date}`}
            className="btn btn-primary btn-sm group/cta w-full sm:w-auto"
          >
            Sign up for this Sunday
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
          </Link>
        )}

        {week.state === "covered" && (
          <div className="flex items-start gap-2.5 rounded-[12px] bg-[color:var(--ok)]/6 px-3.5 py-3">
            <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[color:var(--ok)] text-white">
              <CheckIcon className="h-3 w-3" strokeWidth={3} />
            </span>
            <p className="text-sm text-ink">
              <span className="font-semibold text-[color:var(--ok)]">
                On the menu:
              </span>{" "}
              {week.meal}
            </p>
          </div>
        )}

        {quiet && (
          <p className="flex items-center gap-2 text-sm text-ink-soft">
            <MoonIcon className="h-4 w-4 flex-none" />
            {week.label ?? "No Nexus this week"}
          </p>
        )}

        {week.state === "closed" && (
          <div className="rounded-[12px] bg-[color:var(--need)]/6 px-3.5 py-3 text-sm">
            <p className="flex items-center gap-2 font-semibold text-[color:var(--need)]">
              <UtensilsIcon className="h-4 w-4 flex-none" />
              Signups have closed for this Sunday
            </p>
            <p className="mt-1.5 text-ink-soft">
              Still able to help? Reach out and we&apos;ll sort it out.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
              <a
                href={`mailto:${contactEmail}`}
                className="link-underline inline-flex items-center gap-1.5 font-semibold text-navy-text"
              >
                <MailIcon className="h-3.5 w-3.5" />
                {contactEmail}
              </a>
              <a
                href={`tel:${contactPhone}`}
                className="link-underline inline-flex items-center gap-1.5 font-semibold text-navy-text"
              >
                <PhoneIcon className="h-3.5 w-3.5" />
                {contactPhone}
              </a>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
