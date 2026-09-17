import { requireAdmin } from "@/lib/session";
import { getOverview, getSettings } from "@/lib/settings";
import { getWeekViews } from "@/lib/weeks";
import { formatDateLong } from "@/lib/schedule";
import { ManualSignupForm } from "../ManualSignupForm";

export default async function NewSignupPage() {
  await requireAdmin();
  const [settings, overview] = await Promise.all([getSettings(), getOverview()]);
  const weeks = await getWeekViews(settings.scheduleWindowWeeks, settings, overview);
  const available = weeks.filter((w) => w.state !== "no_nexus" && !w.signup);

  return (
    <div>
      <h1 className="font-heading text-navy-text text-2xl mb-4">
        Add a signup
      </h1>
      {available.length === 0 ? (
        <p className="text-ink-soft">No open weeks available.</p>
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
