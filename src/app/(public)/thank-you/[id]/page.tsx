import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UtensilsIcon,
} from "@/components/Icons";
import { getOverview, getSettings } from "@/lib/settings";
import { getSignup, getWeekOverride } from "@/lib/signups";
import {
  formatDateLong,
  formatRelativeSunday,
  formatTime12h,
} from "@/lib/schedule";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
import { Celebrate } from "./Celebrate";
import { ShareRecap } from "./ShareRecap";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "You're signed up",
  robots: { index: false, follow: false },
};

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
  const firstName = signup.name?.trim().split(/\s+/)[0];
  const dateLong = formatDateLong(signup.date);

  const recap = [
    `Nexus meal — ${dateLong}`,
    `Arrive by ${formatTime12h(arrivalTime)}`,
    `Ready to serve by ${formatTime12h(overview.readyTime)}`,
    `Meal: ${signup.meal}`,
    `Address: ${settings.address}`,
    `Entrance: ${settings.entrance}`,
    `Questions: ${settings.contactEmail} / ${settings.contactPhone}`,
  ].join("\n");

  const recapRows = [
    {
      icon: <CalendarIcon className="h-4 w-4" />,
      label: "Date",
      value: dateLong,
    },
    {
      icon: <ClockIcon className="h-4 w-4" />,
      label: "Arrive by",
      value: formatTime12h(arrivalTime),
    },
    {
      icon: <UtensilsIcon className="h-4 w-4" />,
      label: "Meal",
      value: signup.meal,
    },
    {
      icon: <MapPinIcon className="h-4 w-4" />,
      label: "Address",
      value: `${settings.address} · ${settings.entrance}`,
    },
  ];

  return (
    <>
      <Celebrate />

      <Hero
        compact
        eyebrow={formatRelativeSunday(signup.date)}
        title={firstName ? `Thank you, ${firstName}!` : "Thank you!"}
        subtitle={`You're bringing dinner on ${dateLong}.`}
      />

      <main className="relative z-10 mx-auto max-w-[1140px] px-6 py-10">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
          <div>
            <Reveal>
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[color:var(--ok)] text-white enter-pop">
                  <CheckIcon className="h-6 w-6" strokeWidth={3} />
                </span>
                <p className="max-w-prose text-lg leading-relaxed text-ink">
                  That Sunday is officially yours. The meal is one of the most
                  highly requested parts of Nexus — students love eating
                  together and visiting with one another, and that doesn&apos;t
                  happen without people like you.
                </p>
              </div>
            </Reveal>

            <Reveal>
              <section className="card mt-7 overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-rule px-5 py-3.5">
                  <h2 className="display text-base text-navy-text">
                    Your recap
                  </h2>
                  <ShareRecap text={recap} />
                </div>
                <dl className="divide-y divide-rule">
                  {recapRows.map((row) => (
                    <div
                      key={row.label}
                      className="flex gap-4 px-5 py-3.5 transition-colors hover:bg-paper-sunk sm:gap-6"
                    >
                      <dt className="flex w-28 flex-none items-start gap-2 text-sm font-semibold text-ink-soft">
                        <span className="mt-0.5 text-navy-stripe">
                          {row.icon}
                        </span>
                        {row.label}
                      </dt>
                      <dd className="min-w-0 flex-1 text-ink">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </Reveal>

            <Reveal>
              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-ink-soft">
                  Put it on your calendar so it doesn&apos;t sneak up on you:
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={googleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Add to Google Calendar
                  </a>
                  <a
                    href={`/api/ics/${signup.id}`}
                    className="btn btn-secondary"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Add to Apple or Outlook
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal className="mt-8 lg:mt-0">
            <div className="panel bg-paper-sunk p-5 lg:sticky lg:top-[calc(var(--nav-h)+24px)]">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-faint">
                Plans change?
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                No hard feelings — just let us know as early as you can so we
                can reopen the week.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="link-underline inline-flex items-center gap-2 text-sm font-semibold text-navy-text"
                >
                  <MailIcon className="h-4 w-4 flex-none text-ink-faint" />
                  {settings.contactEmail}
                </a>
                <a
                  href={`tel:${settings.contactPhone}`}
                  className="link-underline inline-flex items-center gap-2 text-sm font-semibold text-navy-text"
                >
                  <PhoneIcon className="h-4 w-4 flex-none text-ink-faint" />
                  {settings.contactPhone}
                </a>
              </div>

              <hr className="my-5 border-rule" />

              <p className="text-sm text-ink-soft">
                Know someone else who&apos;d enjoy this?
              </p>
              <Link
                href="/schedule"
                className="link-underline mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-text"
              >
                Show them the open Sundays
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </main>
    </>
  );
}
