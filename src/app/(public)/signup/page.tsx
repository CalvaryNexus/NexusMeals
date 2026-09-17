import { Hero } from "@/components/Hero";
import { getOverview, getSettings } from "@/lib/settings";
import { getWeekViews } from "@/lib/weeks";
import { formatDateLong } from "@/lib/schedule";
import { SignupForm } from "./SignupForm";

export const dynamic = "force-dynamic";

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
  const weeks = await getWeekViews(settings.scheduleWindowWeeks, settings, overview);

  const openWeeks = weeks.filter(
    (w) => w.state === "open" || w.state === "urgent",
  );
  const preselected =
    requestedDate && openWeeks.some((w) => w.date === requestedDate)
      ? requestedDate
      : (openWeeks[0]?.date ?? "");

  const nearbyMeals = weeks
    .filter((w) => w.state === "covered" && w.meal)
    .slice(0, 5)
    .map((w) => `${formatDateLong(w.date)}: ${w.meal}`);

  if (openWeeks.length === 0) {
    return (
      <>
        <Hero eyebrow="Sign up" title="Bring a Sunday meal" />
        <main className="mx-auto max-w-[1140px] px-6 py-10">
          <p className="text-ink">
            There are no open weeks right now. Please check back soon or
            contact us at{" "}
            <a href={`mailto:${settings.contactEmail}`} className="underline">
              {settings.contactEmail}
            </a>
            .
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Hero eyebrow="Sign up" title="Bring a Sunday meal" />
      <main className="mx-auto max-w-[1140px] px-6 py-10">
        <SignupForm
          weeks={openWeeks.map((w) => ({
            date: w.date,
            label: formatDateLong(w.date),
          }))}
          preselectedDate={preselected}
          nearbyMeals={nearbyMeals}
          turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          consentLine={CONSENT_LINE}
        />
      </main>
    </>
  );
}
