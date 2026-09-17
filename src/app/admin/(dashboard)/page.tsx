import Link from "next/link";
import { getCurrentAdmin } from "@/lib/session";
import { getOverview, getSettings } from "@/lib/settings";
import { getWeekViews } from "@/lib/weeks";
import { listNeedsContact } from "@/lib/signups";
import {
  formatDateMedium,
  formatRelativeSunday,
  formatTime12h,
} from "@/lib/schedule";
import { WeekBadge } from "@/components/WeekBadge";
import { CopyButton } from "@/components/CopyButton";
import {
  AlertIcon,
  CalendarIcon,
  CheckCircleIcon,
  DownloadIcon,
  MailIcon,
  PhoneIcon,
  PlusIcon,
  UsersIcon,
} from "@/components/Icons";
import { SignupRow } from "./SignupRow";
import { NeedsContactRow } from "./NeedsContactRow";
import { PageHeader, StatTile } from "./PageHeader";

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  const [settings, overview] = await Promise.all([getSettings(), getOverview()]);
  const [allWeeks, needsContact] = await Promise.all([
    getWeekViews(settings.scheduleWindowWeeks, settings, overview),
    listNeedsContact(),
  ]);
  const weeks = allWeeks.slice(0, 3);

  const openCount = allWeeks.filter(
    (w) => w.state === "open" || w.state === "urgent",
  ).length;
  const coveredCount = allWeeks.filter((w) => w.state === "covered").length;
  const uncoveredSoon = allWeeks
    .slice(0, 4)
    .filter((w) => w.state === "open" || w.state === "urgent").length;

  return (
    <div className="space-y-10">
      <div>
        <PageHeader
          title="Dashboard"
          description="What needs attention in the next few weeks."
        >
          <Link href="/admin/signups/new" className="btn btn-sm btn-primary">
            <PlusIcon className="h-4 w-4" />
            Add signup
          </Link>
        </PageHeader>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile
            value={uncoveredSoon}
            label="Open in next 4 weeks"
            tone={uncoveredSoon > 0 ? "need" : "ok"}
            icon={<AlertIcon className="h-5 w-5" />}
          />
          <StatTile
            value={coveredCount}
            label="Weeks covered"
            tone="ok"
            icon={<CheckCircleIcon className="h-5 w-5" />}
          />
          <StatTile
            value={openCount}
            label="Open in the window"
            icon={<CalendarIcon className="h-5 w-5" />}
          />
        </div>
      </div>

      <section>
        <h2 className="display mb-4 text-lg text-navy-text">Next 3 Sundays</h2>
        <div className="space-y-3">
          {weeks.map((week, i) => (
            <div
              key={week.date}
              className="panel p-5 enter-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-[200px] flex-1">
                  <p className="font-semibold text-ink">
                    {formatDateMedium(week.date)}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    <span className="font-semibold text-navy-stripe">
                      {formatRelativeSunday(week.date)}
                    </span>{" "}
                    · Arrive by {formatTime12h(week.arrivalTime)}
                  </p>
                </div>
                <WeekBadge
                  state={week.state}
                  color={week.color}
                  className="flex-none"
                />
              </div>

              {week.signup ? (
                <div className="mt-4 rounded-[12px] bg-paper-sunk p-4">
                  <p className="text-sm text-ink">
                    <span className="font-semibold text-navy-text">Meal:</span>{" "}
                    {week.signup.meal}
                  </p>

                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-ink-faint">
                        <UsersIcon className="h-3.5 w-3.5" />
                        Point person
                      </dt>
                      <dd className="mt-0.5 font-medium text-ink">
                        {week.signup.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-ink-faint">
                        <PhoneIcon className="h-3.5 w-3.5" />
                        Phone
                      </dt>
                      <dd className="mt-0.5 flex items-center gap-1">
                        <a
                          href={`tel:${week.signup.phone}`}
                          className="link-underline font-medium text-navy-text"
                        >
                          {week.signup.phone}
                        </a>
                        {week.signup.phone && (
                          <CopyButton value={week.signup.phone} label="phone" />
                        )}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-ink-faint">
                        <MailIcon className="h-3.5 w-3.5" />
                        Email
                      </dt>
                      <dd className="mt-0.5 flex items-center gap-1">
                        <a
                          href={`mailto:${week.signup.email}`}
                          className="link-underline truncate font-medium text-navy-text"
                        >
                          {week.signup.email}
                        </a>
                        {week.signup.email && (
                          <CopyButton value={week.signup.email} label="email" />
                        )}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4">
                    <SignupRow
                      signupId={week.signup.id}
                      reminderSent={week.signup.reminderSent}
                    />
                  </div>
                </div>
              ) : (
                week.state !== "no_nexus" && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-dashed border-card-line bg-paper-sunk px-4 py-3">
                    <p className="text-sm text-ink-soft">
                      No signup yet for this Sunday.
                    </p>
                    <Link
                      href="/admin/signups/new"
                      className="btn btn-sm btn-secondary"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add one
                    </Link>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="display mb-1 text-lg text-navy-text">Needs contact</h2>
        <p className="mb-4 text-sm text-ink-soft">
          Volunteers whose week was cancelled after they signed up.
        </p>
        {needsContact.length === 0 ? (
          <div className="panel flex items-center gap-3 px-5 py-6 text-sm text-ink-soft">
            <CheckCircleIcon className="h-5 w-5 flex-none text-[color:var(--ok)]" />
            Nothing needs contact right now.
          </div>
        ) : (
          <div className="space-y-3">
            {needsContact.map((s) => (
              <div
                key={s.id}
                className="panel edge-warn flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {formatDateMedium(s.date)} · {s.name}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-ink-soft">
                    <a
                      href={`tel:${s.phone}`}
                      className="link-underline text-navy-text"
                    >
                      {s.phone}
                    </a>
                    <a
                      href={`mailto:${s.email}`}
                      className="link-underline text-navy-text"
                    >
                      {s.email}
                    </a>
                  </p>
                </div>
                <NeedsContactRow signupId={s.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="display mb-1 text-lg text-navy-text">
          Public schedule QR code
        </h2>
        <p className="mb-4 text-sm text-ink-soft">
          Print it on a bulletin insert or a table tent so families can sign up
          on the spot.
        </p>
        <a href="/api/admin/qr" className="btn btn-secondary">
          <DownloadIcon className="h-4 w-4" />
          Download QR code
        </a>
      </section>

      {admin?.role !== "owner" && (
        <p className="rounded-[12px] bg-card px-4 py-3 text-sm text-navy-text">
          You&apos;re signed in as a viewer. Overview, settings, and account
          management are limited to owner accounts.
        </p>
      )}
    </div>
  );
}
