import { requireOwner } from "@/lib/session";
import { getOverview, getSettings } from "@/lib/settings";
import { getWeekViews } from "@/lib/weeks";
import {
  formatDateMedium,
  formatRelativeSunday,
  formatTime12h,
} from "@/lib/schedule";
import { AdminWeekRow } from "./AdminWeekRow";
import { PageHeader } from "../PageHeader";

export default async function AdminSchedulePage() {
  await requireOwner();
  const [settings, overview] = await Promise.all([getSettings(), getOverview()]);
  const weeks = await getWeekViews(
    settings.scheduleWindowWeeks,
    settings,
    overview,
  );

  return (
    <div>
      <PageHeader
        title="Schedule management"
        description="Take a Sunday off the schedule, or override the arrival time for a single week."
      />
      <div className="space-y-3">
        {weeks.map((week) => (
          <AdminWeekRow
            key={week.date}
            date={week.date}
            dateLabel={formatDateMedium(week.date)}
            relative={formatRelativeSunday(week.date)}
            state={week.state}
            meal={week.meal}
            hasSignup={!!week.signup}
            initialLabel={week.label}
            initialArrivalOverride={
              week.arrivalTime !== overview.arrivalTime
                ? week.arrivalTime
                : undefined
            }
            defaultArrivalTime={formatTime12h(overview.arrivalTime)}
          />
        ))}
      </div>
    </div>
  );
}
