import Link from "next/link";
import { Hero } from "@/components/Hero";
import { getOverview, getSettings } from "@/lib/settings";
import { getWeekViews } from "@/lib/weeks";
import { sanitizeRichText } from "@/lib/sanitize";
import { formatDateLong, formatTime12h } from "@/lib/schedule";

export const dynamic = "force-dynamic";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[12px] bg-card border border-card-line p-6">
      <h2 className="font-heading text-navy-text text-xl">{title}</h2>
      <div className="mt-3 text-ink">{children}</div>
    </section>
  );
}

function ListSection({
  title,
  items,
}: {
  title: string;
  items: { label: string; count?: number }[];
}) {
  if (items.length === 0) return null;
  return (
    <Section title={title}>
      <ul className="list-disc pl-5 space-y-1">
        {items.map((item, i) => (
          <li key={i}>
            {item.label}
            {typeof item.count === "number" ? ` (${item.count})` : ""}
          </li>
        ))}
      </ul>
    </Section>
  );
}

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: requestedDate } = await searchParams;
  const [overview, settings] = await Promise.all([
    getOverview(),
    getSettings(),
  ]);

  let signupDate: string | undefined;
  if (requestedDate) {
    const weeks = await getWeekViews(settings.scheduleWindowWeeks, settings, overview);
    const match = weeks.find(
      (w) =>
        w.date === requestedDate &&
        (w.state === "open" || w.state === "urgent"),
    );
    if (match) signupDate = match.date;
  }

  return (
    <>
      <Hero
        eyebrow="Before you sign up"
        title="What to know about Nexus"
        subtitle={
          signupDate
            ? `Here's what to know before you sign up for ${formatDateLong(signupDate)}.`
            : undefined
        }
      />
      <main className="mx-auto max-w-[1140px] px-6 py-10 space-y-6">
        <Section title="Headcount">
          <p>Plan for about {overview.headcount} students.</p>
        </Section>

        <Section title="Timing">
          <ul className="space-y-1">
            <li>Arrive by {formatTime12h(overview.arrivalTime)}.</li>
            <li>Food ready to serve by {formatTime12h(overview.readyTime)}.</li>
            <li>Food is prepared beforehand.</li>
            <li>
              Cleanup takes about 10 to 15 minutes after serving, with
              students and volunteers helping. Please plan to stay and help
              pack up your dishes.
            </li>
            <li>Done around {formatTime12h(overview.endTime)}.</li>
          </ul>
          <p className="text-ink-soft text-sm mt-2">
            Some weeks have a different arrival time. Check the specific week
            on the schedule.
          </p>
        </Section>

        <Section title="What teens like">
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeRichText(overview.whatTeensLike),
            }}
          />
        </Section>

        <Section title="Spice guidance">
          <p>{overview.spiceGuidance}</p>
        </Section>

        <ListSection title="Dietary needs" items={overview.dietaryNeeds} />

        {overview.mealIdeas.length > 0 && (
          <Section title="Meal ideas students love">
            <p className="text-ink-soft text-sm mb-2">
              Need some ideas? Here are meals students have loved. These are
              just suggestions, not requirements.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              {overview.mealIdeas.map((item, i) => (
                <li key={i}>{item.label}</li>
              ))}
            </ul>
          </Section>
        )}

        <ListSection
          title="Provided by Nexus"
          items={overview.providedByNexus}
        />

        <Section title="Please bring">
          <ul className="list-disc pl-5 space-y-1">
            {overview.pleaseBring.map((item, i) => (
              <li key={i}>{item.label}</li>
            ))}
          </ul>
        </Section>

        <ListSection title="Current needs" items={overview.currentNeeds} />

        <Section title="Teaming up">
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeRichText(overview.teamingUpNote),
            }}
          />
        </Section>

        <Section title="Location">
          <p>{settings.address}</p>
          <p className="text-ink-soft">{settings.entrance}</p>
        </Section>

        <div className="pt-4">
          {signupDate ? (
            <Link
              href={`/signup?date=${signupDate}`}
              className="tap-target inline-flex items-center justify-center rounded-[8px] bg-navy px-6 py-3 text-white font-semibold hover:bg-navy-text transition-colors"
            >
              Continue to sign up
            </Link>
          ) : (
            <Link
              href="/schedule"
              className="tap-target inline-flex items-center justify-center rounded-[8px] bg-navy px-5 py-2.5 text-white font-semibold hover:bg-navy-text transition-colors"
            >
              View the schedule
            </Link>
          )}
        </div>
      </main>
    </>
  );
}
