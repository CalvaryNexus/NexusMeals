import { requireOwner } from "@/lib/session";
import { getOverview, getSettings } from "@/lib/settings";
import { getWeekViews } from "@/lib/weeks";
import { formatDateLong, formatTime12h } from "@/lib/schedule";
import { AdminWeekRow } from "./AdminWeekRow";

export default async function AdminSchedulePage() {
  await requireOwner();
  const [settings, overview] = await Promise.all([getSettings(), getOverview()]);
  const weeks = await getWeekViews(settings.scheduleWindowWeeks, settings, overview);

  return (
    <div>
      <h1 className="font-heading text-navy-text text-2xl mb-4">
        Schedule management
      </h1>
      <div className="space-y-4">
        {weeks.map((week) => (
          <AdminWeekRow
            key={week.date}
            date={week.date}
            dateLabel={formatDateLong(week.date)}
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
