import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/Hero";
import { ArrowLeftIcon, MailIcon } from "@/components/Icons";
import { getOverview, getSettings } from "@/lib/settings";
import { getWeekViews } from "@/lib/weeks";
import {
  formatDateLong,
  formatDateNoYear,
  formatRelativeSunday,
  formatTime12h,
} from "@/lib/schedule";
import { SignupForm } from "./SignupForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Claim a Sunday and tell us what you're bringing.",
};

const CONSENT_LINE =
  "Your contact info is only used by the Nexus team to coordinate your meal and send reminders.";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: requestedDate } = await searchParams;
  const [settings, overview] = await Promise.all([
    getSettings(),
    getOverview(),
  ]);
  const weeks = await getWeekViews(
    settings.scheduleWindowWeeks,
    settings,
    overview,
  );

  const openWeeks = weeks.filter(
    (w) => w.state === "open" || w.state === "urgent",
  );
  const preselected =
    requestedDate && openWeeks.some((w) => w.date === requestedDate)
      ? requestedDate
      : (openWeeks[0]?.date ?? "");

  const nearbyMeals = weeks
    .filter((w) => w.state === "covered" && w.meal)
    .slice(0, 4)
    .map((w) => ({
      date: w.date,
      label: formatDateLong(w.date),
      meal: w.meal as string,
    }));

  if (openWeeks.length === 0) {
    return (
      <>
        <Hero
          compact
          eyebrow="Sign up"
          title="Every Sunday is spoken for"
          subtitle="That's a good problem to have. Check back soon — new weeks open as the schedule rolls forward."
        />
        <main className="mx-auto max-w-[1140px] px-6 py-10">
          <div className="panel max-w-xl p-6">
            <p className="text-ink">
              If you&apos;d still like to help — teaming up with another family,
              covering a last-minute gap, or taking a week further out —
              we&apos;d love to hear from you.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`mailto:${settings.contactEmail}`}
                className="btn btn-primary"
              >
                <MailIcon className="h-4 w-4" />
                Email the Nexus team
              </a>
              <Link href="/schedule" className="btn btn-secondary">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to the schedule
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Hero
        compact
        eyebrow="Sign up"
        title="Bring a Sunday meal"
        subtitle="Three short steps. Nothing is reserved until you submit."
      >
        <Link
          href="/overview"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Review what to know first
        </Link>
      </Hero>

      <main className="mx-auto max-w-[1140px] px-6 py-10">
        <SignupForm
          weeks={openWeeks.map((w) => ({
            date: w.date,
            label: formatDateLong(w.date),
            shortLabel: formatDateNoYear(w.date),
            arrivalLabel: formatTime12h(w.arrivalTime),
            relative: formatRelativeSunday(w.date),
          }))}
          preselectedDate={preselected}
          nearbyMeals={nearbyMeals}
          mealIdeas={overview.mealIdeas.map((i) => i.label)}
          turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          consentLine={CONSENT_LINE}
        />
      </main>
    </>
  );
}
