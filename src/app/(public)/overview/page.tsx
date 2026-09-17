import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  HeartIcon,
  InfoIcon,
  MapPinIcon,
  SparkIcon,
  UsersIcon,
  UtensilsIcon,
} from "@/components/Icons";
import { getOverview, getSettings } from "@/lib/settings";
import { getWeekViews } from "@/lib/weeks";
import { sanitizeRichText } from "@/lib/sanitize";
import { formatDateLong, formatTime12h } from "@/lib/schedule";
import { OverviewNav } from "./OverviewNav";
import { StickyCta } from "./StickyCta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "What to know",
  description: "Everything to know before bringing a Sunday meal for Nexus.",
};

function Section({
  id,
  title,
  icon,
  children,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Reveal as="section">
      <div
        id={id}
        className="card card-interactive scroll-mt-[calc(var(--nav-h)+24px)] p-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-card text-navy-stripe">
            {icon}
          </span>
          <h2 className="display text-lg text-navy-text sm:text-xl">{title}</h2>
        </div>
        <div className="prose-rich mt-4 text-ink">{children}</div>
      </div>
    </Reveal>
  );
}

function Bullets({ items }: { items: { label: string; count?: number }[] }) {
  return (
    <ul className="bullets">
      {items.map((item, i) => (
        <li key={i}>
          {item.label}
          {typeof item.count === "number" && (
            <span className="ml-2 rounded-full bg-card px-2 py-0.5 text-xs font-semibold text-navy-text">
              {item.count}
            </span>
          )}
        </li>
      ))}
    </ul>
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
    const weeks = await getWeekViews(
      settings.scheduleWindowWeeks,
      settings,
      overview,
    );
    const match = weeks.find(
      (w) =>
        w.date === requestedDate &&
        (w.state === "open" || w.state === "urgent"),
    );
    if (match) signupDate = match.date;
  }

  const hasDietary = overview.dietaryNeeds.length > 0;
  const hasIdeas = overview.mealIdeas.length > 0;
  const hasProvided = overview.providedByNexus.length > 0;
  const hasNeeds = overview.currentNeeds.length > 0;

  // Built here so the side rail only lists sections that actually render.
  const sections = [
    { id: "headcount", title: "Headcount" },
    { id: "timing", title: "How the night runs" },
    { id: "teens", title: "What teens like" },
    { id: "spice", title: "Spice guidance" },
    ...(hasDietary ? [{ id: "dietary", title: "Dietary needs" }] : []),
    ...(hasIdeas ? [{ id: "ideas", title: "Meal ideas" }] : []),
    ...(hasProvided ? [{ id: "provided", title: "Provided by Nexus" }] : []),
    { id: "bring", title: "Please bring" },
    ...(hasNeeds ? [{ id: "needs", title: "Current needs" }] : []),
    { id: "teaming", title: "Teaming up" },
    { id: "location", title: "Location" },
  ];

  const ctaHref = signupDate ? `/signup?date=${signupDate}` : "/schedule";
  const ctaLabel = signupDate ? "Continue to sign up" : "View the schedule";

  return (
    <>
      <Hero
        eyebrow="Before you sign up"
        title="What to know about Nexus"
        subtitle={
          signupDate
            ? `A two-minute read before you commit to ${formatDateLong(signupDate)}.`
            : "A two-minute read that covers everything volunteers usually ask before their first Sunday."
        }
      >
        <Link
          href="/schedule"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to the schedule
        </Link>
      </Hero>

      <main className="mx-auto max-w-[1140px] px-6 py-10 pb-28 lg:pb-10">
        <div className="lg:grid lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-10">
          <aside className="hidden lg:block">
            <OverviewNav sections={sections} />
          </aside>

          <div className="space-y-5">
            {signupDate && (
              <div className="flex items-start gap-3 rounded-[14px] border border-card-line bg-card px-4 py-3.5 enter-up">
                <CheckIcon className="mt-0.5 h-5 w-5 flex-none text-navy-stripe" />
                <p className="text-sm text-ink">
                  You&apos;re looking at{" "}
                  <span className="font-semibold text-navy-text">
                    {formatDateLong(signupDate)}
                  </span>
                  . It&apos;s still open — nothing is reserved until you finish
                  the form.
                </p>
              </div>
            )}

            <Section
              id="headcount"
              title="Headcount"
              icon={<UsersIcon className="h-5 w-5" />}
            >
              <p className="text-lg">
                Plan for about{" "}
                <span className="display text-navy-text">
                  {overview.headcount} students
                </span>
                .
              </p>
            </Section>

            <Section
              id="timing"
              title="How the night runs"
              icon={<ClockIcon className="h-5 w-5" />}
            >
              <ol className="relative list-none space-y-4 border-l border-card-line pl-6">
                {[
                  {
                    time: formatTime12h(overview.arrivalTime),
                    text: "Arrive and set up. Food is prepared beforehand.",
                  },
                  {
                    time: formatTime12h(overview.readyTime),
                    text: "Food ready to serve.",
                  },
                  {
                    time: "After serving",
                    text: "Cleanup takes about 10 to 15 minutes, with students and volunteers helping. Please plan to stay and help pack up your dishes.",
                  },
                  {
                    time: formatTime12h(overview.endTime),
                    text: "Done for the night.",
                  },
                ].map((step) => (
                  <li key={step.time} className="relative">
                    <span
                      aria-hidden
                      className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-navy-stripe"
                    />
                    <p className="font-semibold text-navy-text">{step.time}</p>
                    <p className="text-ink-soft">{step.text}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-4 flex items-start gap-2 rounded-[10px] bg-paper-sunk px-3 py-2.5 text-sm text-ink-soft">
                <InfoIcon className="mt-0.5 h-4 w-4 flex-none" />
                Some weeks have a different arrival time. Check the specific week
                on the schedule.
              </p>
            </Section>

            <Section
              id="teens"
              title="What teens like"
              icon={<HeartIcon className="h-5 w-5" />}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichText(overview.whatTeensLike),
                }}
              />
            </Section>

            <Section
              id="spice"
              title="Spice guidance"
              icon={<SparkIcon className="h-5 w-5" />}
            >
              <p>{overview.spiceGuidance}</p>
            </Section>

            {hasDietary && (
              <Section
                id="dietary"
                title="Dietary needs"
                icon={<AllergyIcon />}
              >
                <Bullets items={overview.dietaryNeeds} />
              </Section>
            )}

            {hasIdeas && (
              <Section
                id="ideas"
                title="Meal ideas students love"
                icon={<UtensilsIcon className="h-5 w-5" />}
              >
                <p className="mb-3 text-sm text-ink-soft">
                  Suggestions, not requirements — these are meals that have gone
                  over well.
                </p>
                <ul className="flex list-none flex-wrap gap-2">
                  {overview.mealIdeas.map((item, i) => (
                    <li
                      key={i}
                      className="rounded-full border border-card-line bg-card px-3 py-1.5 text-sm font-medium text-navy-text"
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {hasProvided && (
              <Section
                id="provided"
                title="Provided by Nexus"
                icon={<CheckIcon className="h-5 w-5" />}
              >
                <Bullets items={overview.providedByNexus} />
              </Section>
            )}

            <Section
              id="bring"
              title="Please bring"
              icon={<UtensilsIcon className="h-5 w-5" />}
            >
              <Bullets items={overview.pleaseBring} />
            </Section>

            {hasNeeds && (
              <Section
                id="needs"
                title="Current needs"
                icon={<SparkIcon className="h-5 w-5" />}
              >
                <Bullets items={overview.currentNeeds} />
              </Section>
            )}

            <Section
              id="teaming"
              title="Teaming up"
              icon={<UsersIcon className="h-5 w-5" />}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichText(overview.teamingUpNote),
                }}
              />
            </Section>

            <Section
              id="location"
              title="Location"
              icon={<MapPinIcon className="h-5 w-5" />}
            >
              <p className="font-semibold text-navy-text">{settings.address}</p>
              <p className="text-ink-soft">{settings.entrance}</p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(settings.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-text"
              >
                Open in Maps
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </a>
            </Section>

            <Reveal>
              <div className="hidden rounded-[18px] bg-navy px-6 py-7 text-white lg:block">
                <p className="display text-xl">
                  {signupDate ? "Ready when you are." : "Pick your Sunday."}
                </p>
                <p className="mt-1.5 max-w-prose text-white/75">
                  {signupDate
                    ? "The form takes about a minute. You'll get a recap and a calendar invite right after."
                    : "Choose an open week and we'll bring you back here with the details for that date."}
                </p>
                <Link
                  href={ctaHref}
                  className="btn btn-lg mt-5 bg-white text-navy-text hover:bg-card"
                >
                  {ctaLabel}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </main>

      <StickyCta
        href={ctaHref}
        label={ctaLabel}
        note={signupDate ? formatDateLong(signupDate) : undefined}
      />
    </>
  );
}

/** Small one-off mark for the dietary section. */
function AllergyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M6 18L18 6" />
    </svg>
  );
}
