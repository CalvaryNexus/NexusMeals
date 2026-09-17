import { notFound } from "next/navigation";
import { Hero } from "@/components/Hero";
import { getOverview, getSettings } from "@/lib/settings";
import { getSignup, getWeekOverride } from "@/lib/signups";
import { formatDateLong, formatTime12h } from "@/lib/schedule";
import { buildGoogleCalendarUrl } from "@/lib/calendar";

export const dynamic = "force-dynamic";

export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [signup, overview, settings] = await Promise.all([
    getSignup(id),
    getOverview(),
    getSettings(),
  ]);
  if (!signup || signup.purged) {
    notFound();
  }

  const override = await getWeekOverride(signup.date);
  const arrivalTime = override?.arrivalOverride ?? overview.arrivalTime;

  const calendarInput = {
    date: signup.date,
    arrivalTime,
    endTime: overview.endTime,
    readyTime: overview.readyTime,
    meal: signup.meal,
    address: settings.address,
    entrance: settings.entrance,
    pleaseBring: overview.pleaseBring.map((i) => i.label),
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
  };

  const googleUrl = buildGoogleCalendarUrl(calendarInput);

  return (
    <>
      <Hero eyebrow="You're signed up" title="Thank you!" />
      <main className="mx-auto max-w-[1140px] px-6 py-10 space-y-6">
        <p className="text-ink text-lg max-w-prose">
          You&apos;re signed up to bring dinner on {formatDateLong(signup.date)}
          . The Sunday night meal is one of the most highly requested parts of
          Nexus. Students love eating together and visiting with one another,
          and that doesn&apos;t happen without people like you. We&apos;re
          grateful for your help.
        </p>
        <p className="text-ink-soft">
          If your plans change, please contact us at{" "}
          <a href={`mailto:${settings.contactEmail}`} className="underline">
            {settings.contactEmail}
          </a>{" "}
          or{" "}
          <a href={`tel:${settings.contactPhone}`} className="underline">
            {settings.contactPhone}
          </a>
          .
        </p>

        <section className="rounded-[12px] bg-card border border-card-line p-6 max-w-xl">
          <h2 className="font-heading text-navy-text text-xl mb-3">Recap</h2>
          <ul className="space-y-1 text-ink">
            <li>
              <span className="font-semibold">Date:</span>{" "}
              {formatDateLong(signup.date)}
            </li>
            <li>
              <span className="font-semibold">Arrive by:</span>{" "}
              {formatTime12h(arrivalTime)}
            </li>
            <li>
              <span className="font-semibold">Meal:</span> {signup.meal}
            </li>
            <li>
              <span className="font-semibold">Address:</span>{" "}
              {settings.address}
            </li>
            <li>
              <span className="font-semibold">Entrance:</span>{" "}
              {settings.entrance}
            </li>
          </ul>
        </section>

        <div className="flex flex-wrap gap-3">
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="tap-target inline-flex items-center justify-center rounded-[8px] bg-navy px-5 py-2.5 text-white font-semibold hover:bg-navy-text transition-colors"
          >
            Add to Google Calendar
          </a>
          <a
            href={`/api/ics/${signup.id}`}
            className="tap-target inline-flex items-center justify-center rounded-[8px] border border-navy px-5 py-2.5 text-navy-text font-semibold hover:bg-card transition-colors"
          >
            Add to Apple/Outlook
          </a>
        </div>
      </main>
    </>
  );
}
