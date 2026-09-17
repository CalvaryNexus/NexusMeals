import Link from "next/link";
import { Hero } from "@/components/Hero";
import { WeekBadge } from "@/components/WeekBadge";
import { getSettings, getOverview } from "@/lib/settings";
import { getWeekViews } from "@/lib/weeks";
import { formatDateLong, formatTime12h } from "@/lib/schedule";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const [settings, overview] = await Promise.all([
    getSettings(),
    getOverview(),
  ]);
  const weeks = await getWeekViews(settings.scheduleWindowWeeks, settings, overview);

  return (
    <>
      <Hero
        eyebrow="Nexus Sunday Meal"
        title="Bring dinner for Nexus"
        subtitle="Families and volunteers sign up to bring the Sunday night meal for our students. Pick an open week below to get started."
      />
      <main className="mx-auto max-w-[1140px] px-6 py-10">
        <div className="mb-6">
          <Link
            href="/overview"
            className="text-navy-text font-semibold underline underline-offset-4"
          >
            See what to know before you sign up
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {weeks.map((week) => (
            <li
              key={week.date}
              className="rounded-[12px] border border-rule bg-paper p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">
                    {formatDateLong(week.date)}
                  </p>
                  <p className="text-ink-soft text-sm mt-1">
                    Arrive by {formatTime12h(week.arrivalTime)}
                  </p>
                </div>
                <WeekBadge
                  state={week.state}
                  color={week.color}
                  label={week.state === "no_nexus" ? week.label : undefined}
                />
              </div>

              <div className="mt-4">
                {(week.state === "open" || week.state === "urgent") && (
                  <Link
                    href={`/signup?date=${week.date}`}
                    className="tap-target inline-flex items-center justify-center rounded-[8px] bg-navy px-5 py-2.5 text-white font-semibold hover:bg-navy-text transition-colors"
                  >
                    Sign up
                  </Link>
                )}
                {week.state === "covered" && (
                  <p className="text-ink">
                    <span className="text-ok font-semibold">Covered:</span>{" "}
                    {week.meal}
                  </p>
                )}
                {week.state === "no_nexus" && (
                  <p className="text-ink-soft">
                    {week.label ?? "No Nexus this week"}
                  </p>
                )}
                {week.state === "closed" && (
                  <p className="text-need">
                    Still need help? Contact us at{" "}
                    <a href={`mailto:${settings.contactEmail}`} className="underline">
                      {settings.contactEmail}
                    </a>{" "}
                    or{" "}
                    <a href={`tel:${settings.contactPhone}`} className="underline">
                      {settings.contactPhone}
                    </a>
                    .
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
