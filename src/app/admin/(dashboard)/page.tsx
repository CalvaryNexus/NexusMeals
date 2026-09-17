import { getCurrentAdmin } from "@/lib/session";
import { getOverview, getSettings } from "@/lib/settings";
import { getWeekViews } from "@/lib/weeks";
import { listNeedsContact } from "@/lib/signups";
import { formatDateLong, formatTime12h } from "@/lib/schedule";
import { WeekBadge } from "@/components/WeekBadge";
import { SignupRow } from "./SignupRow";
import { NeedsContactRow } from "./NeedsContactRow";

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  const [settings, overview] = await Promise.all([getSettings(), getOverview()]);
  const weeks = await getWeekViews(3, settings, overview);
  const needsContact = await listNeedsContact();

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-heading text-navy-text text-2xl mb-4">
          Next 3 Sundays
        </h1>
        <div className="space-y-4">
          {weeks.map((week) => (
            <div
              key={week.date}
              className="rounded-[12px] border border-rule bg-paper p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">
                    {formatDateLong(week.date)}
                  </p>
                  <p className="text-ink-soft text-sm">
                    Arrive by {formatTime12h(week.arrivalTime)}
                  </p>
                </div>
                <WeekBadge
                  state={week.state}
                  color={week.color}
                  label={week.state === "no_nexus" ? week.label : undefined}
                />
              </div>

              {week.signup && (
                <div className="mt-3 text-ink space-y-1">
                  <p>
                    <span className="font-semibold">Meal:</span>{" "}
                    {week.signup.meal}
                  </p>
                  <p>
                    <span className="font-semibold">Point person:</span>{" "}
                    {week.signup.name}
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span>{" "}
                    {week.signup.phone}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span>{" "}
                    {week.signup.email}
                  </p>
                  <div className="mt-2">
                    <SignupRow
                      signupId={week.signup.id}
                      reminderSent={week.signup.reminderSent}
                    />
                  </div>
                </div>
              )}

              {!week.signup && week.state !== "no_nexus" && (
                <p className="text-ink-soft mt-3">No signup yet.</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-navy-text text-xl mb-4">
          Needs contact
        </h2>
        {needsContact.length === 0 ? (
          <p className="text-ink-soft">Nothing needs contact right now.</p>
        ) : (
          <div className="space-y-3">
            {needsContact.map((s) => (
              <div
                key={s.id}
                className="rounded-[12px] border border-rule bg-card p-4 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold">
                    {formatDateLong(s.date)}: {s.name}
                  </p>
                  <p className="text-ink-soft text-sm">
                    {s.phone} / {s.email}
                  </p>
                </div>
                <NeedsContactRow signupId={s.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-heading text-navy-text text-xl mb-4">
          Public schedule QR code
        </h2>
        <a
          href="/api/admin/qr"
          className="tap-target inline-flex items-center justify-center rounded-[8px] bg-navy px-5 py-2.5 text-white font-semibold hover:bg-navy-text transition-colors"
        >
          Download QR code
        </a>
      </section>

      {admin?.role !== "owner" && (
        <p className="text-ink-soft text-sm">
          Signed in as a viewer. Overview, settings, and account management
          are limited to owner accounts.
        </p>
      )}
    </div>
  );
}
