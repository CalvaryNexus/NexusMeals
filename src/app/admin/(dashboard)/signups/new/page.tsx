import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { getOverview, getSettings } from "@/lib/settings";
import { getWeekViews } from "@/lib/weeks";
import { formatDateLong } from "@/lib/schedule";
import { ManualSignupForm } from "../ManualSignupForm";
import { PageHeader } from "../../PageHeader";

export default async function NewSignupPage() {
  await requireAdmin();
  const [settings, overview] = await Promise.all([getSettings(), getOverview()]);
  const weeks = await getWeekViews(
    settings.scheduleWindowWeeks,
    settings,
    overview,
  );
  const available = weeks.filter((w) => w.state !== "no_nexus" && !w.signup);

  return (
    <div>
      <PageHeader
        title="Add a signup"
        description="For volunteers who sign up in person, by phone, or by email."
      />
      {available.length === 0 ? (
        <div className="panel px-5 py-8 text-center text-ink-soft">
          <p>Every Sunday in the window already has a signup.</p>
          <Link href="/admin" className="btn btn-secondary btn-sm mt-4">
            Back to the dashboard
          </Link>
        </div>
      ) : (
        <ManualSignupForm
          mode="create"
          weeks={available.map((w) => ({
            date: w.date,
            label: formatDateLong(w.date),
          }))}
        />
      )}
    </div>
  );
}
