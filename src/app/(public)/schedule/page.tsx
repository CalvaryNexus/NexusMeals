import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { getSettings, getOverview } from "@/lib/settings";
import { getWeekViews } from "@/lib/weeks";
import {
  formatDateLong,
  formatDateMedium,
  formatDayOfMonth,
  formatMonthShort,
  formatMonthYear,
  formatRelativeSunday,
  formatTime12h,
} from "@/lib/schedule";
import { ScheduleBoard, type WeekCard } from "./ScheduleBoard";
import { TakenNotice } from "./TakenNotice";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Pick a Sunday to bring dinner for Nexus students.",
};

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ taken?: string }>;
}) {
  const [{ taken }, settings, overview] = await Promise.all([
    searchParams,
    getSettings(),
    getOverview(),
  ]);
  const weeks = await getWeekViews(
    settings.scheduleWindowWeeks,
    settings,
    overview,
  );

  const cards: WeekCard[] = weeks.map((week) => ({
    date: week.date,
    state: week.state,
    color: week.color,
    label: week.label,
    meal: week.meal,
    arrivalLabel: formatTime12h(week.arrivalTime),
    dateLong: formatDateLong(week.date),
    dateMedium: formatDateMedium(week.date),
    monthShort: formatMonthShort(week.date),
    dayOfMonth: formatDayOfMonth(week.date),
    monthYear: formatMonthYear(week.date),
    relative: formatRelativeSunday(week.date),
  }));

  const openCount = cards.filter(
    (w) => w.state === "open" || w.state === "urgent",
  ).length;
  const coveredCount = cards.filter((w) => w.state === "covered").length;
  const nextOpen = cards.find((w) => w.state === "open" || w.state === "urgent");

  return (
    <>
      <Hero
        eyebrow="Nexus Sunday Meal"
        title="Bring dinner for Nexus"
        subtitle="Families and volunteers take turns bringing the Sunday night meal for our students. Pick a Sunday that works for you — we'll walk you through the rest."
        stats={[
          { value: String(openCount), label: "Open" },
          { value: String(coveredCount), label: "Covered" },
          { value: `~${overview.headcount}`, label: "Students" },
        ]}
      />

      <main className="mx-auto max-w-[1140px] px-6 py-10">
        {taken === "1" && <TakenNotice />}

        {nextOpen && (
          <p className="mb-6 text-sm text-ink-soft">
            The soonest Sunday that still needs a meal is{" "}
            <span className="font-semibold text-navy-text">
              {nextOpen.dateLong}
            </span>
            .
          </p>
        )}

        <ScheduleBoard
          weeks={cards}
          contactEmail={settings.contactEmail}
          contactPhone={settings.contactPhone}
        />
      </main>
    </>
  );
}
