import { fromZonedTime } from "date-fns-tz";
import type { Settings, WeekColor, WeekComputedState } from "./types";

export const TIME_ZONE = "America/Chicago";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function ymd(y: number, m: number, d: number): string {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function chicagoParts(date: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")) % 24,
    minute: Number(get("minute")),
  };
}

export function addDaysToYMD(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days, 12));
  return ymd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function weekdayIndexOfYMD(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return dt.getUTCDay();
}

export function daysBetweenYMD(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const da = Date.UTC(ay, am - 1, ad, 12);
  const db = Date.UTC(by, bm - 1, bd, 12);
  return Math.round((db - da) / 86400000);
}

export function chicagoTodayYMD(now: Date = new Date()): string {
  const p = chicagoParts(now);
  return ymd(p.year, p.month, p.day);
}

export function nextSundayOnOrAfter(dateStr: string): string {
  const wd = weekdayIndexOfYMD(dateStr);
  const offset = (7 - wd) % 7;
  return addDaysToYMD(dateStr, offset);
}

export function getScheduleWeeks(
  windowWeeks: number,
  now: Date = new Date(),
): string[] {
  const today = chicagoTodayYMD(now);
  const firstSunday = nextSundayOnOrAfter(today);
  const weeks: string[] = [];
  for (let i = 0; i < windowWeeks; i++) {
    weeks.push(addDaysToYMD(firstSunday, i * 7));
  }
  return weeks;
}

/** Instant (UTC) at which signups close for the given Sunday, in America/Chicago wall time. */
export function getCutoffInstant(
  sundayDateStr: string,
  settings: Pick<Settings, "cutoffDay" | "cutoffTime">,
): Date {
  const offsetBack = (7 + (0 - settings.cutoffDay)) % 7;
  const cutoffDateStr = addDaysToYMD(sundayDateStr, -offsetBack);
  return fromZonedTime(`${cutoffDateStr}T${settings.cutoffTime}:00`, TIME_ZONE);
}

/** Instant (UTC) for a given HH:mm on a given Sunday, in America/Chicago wall time. */
export function getChicagoInstant(dateStr: string, time: string): Date {
  return fromZonedTime(`${dateStr}T${time}:00`, TIME_ZONE);
}

export interface ComputedWeek {
  date: string;
  state: WeekComputedState;
  color: WeekColor;
}

export function computeWeekState(params: {
  date: string;
  hasOverride: boolean;
  hasClaim: boolean;
  settings: Settings;
  now?: Date;
}): ComputedWeek {
  const { date, hasOverride, hasClaim, settings } = params;
  const now = params.now ?? new Date();

  if (hasOverride) {
    return { date, state: "no_nexus", color: "ink-soft" };
  }
  if (hasClaim) {
    return { date, state: "covered", color: "ok" };
  }

  const cutoff = getCutoffInstant(date, settings);
  if (now.getTime() > cutoff.getTime()) {
    return { date, state: "closed", color: "need" };
  }

  const today = chicagoTodayYMD(now);
  const daysUntil = daysBetweenYMD(today, date);

  if (daysUntil <= 7) {
    return { date, state: "open", color: "need" };
  }
  if (daysUntil <= 14) {
    return { date, state: "urgent", color: "warn" };
  }
  return { date, state: "open", color: "default" };
}

export function formatDateLong(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(dt);
}

export function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(dt);
}

export function formatTime12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad2(m)} ${period}`;
}

function utcDateFromYMD(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

/** "September 2026" — used for the month dividers on the schedule. */
export function formatMonthYear(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(utcDateFromYMD(dateStr));
}

/** "Sep" — the stacked month label on a week card. */
export function formatMonthShort(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
  }).format(utcDateFromYMD(dateStr));
}

/** "21" — the stacked day number on a week card. */
export function formatDayOfMonth(dateStr: string): string {
  return String(utcDateFromYMD(dateStr).getUTCDate());
}

/**
 * A human-scale description of how far out a Sunday is, so the schedule reads
 * like a conversation ("This Sunday") rather than a list of dates.
 */
export function formatRelativeSunday(
  dateStr: string,
  now: Date = new Date(),
): string {
  const days = daysBetweenYMD(chicagoTodayYMD(now), dateStr);
  if (days < 0) return "Past";
  if (days === 0) return "Today";
  if (days <= 7) return "This Sunday";
  if (days <= 14) return "Next Sunday";
  const weeks = Math.round(days / 7);
  return `In ${weeks} weeks`;
}

/** "September 20, 2026" — the weekday is redundant on a page about Sundays. */
export function formatDateMedium(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(utcDateFromYMD(dateStr));
}

/** "September 20" — compact enough to sit inside a button label. */
export function formatDateNoYear(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
  }).format(utcDateFromYMD(dateStr));
}
