import {
  computeWeekState,
  getScheduleWeeks,
  type ComputedWeek,
} from "./schedule";
import {
  getClaimSignupIds,
  getSignups,
  getWeekOverride,
  getWeekOverrides,
} from "./signups";
import type { Overview, Settings, Signup, WeekView } from "./types";

/**
 * State of a week a client asked to sign up for, ignoring any existing claim
 * (the atomic claim decides that). Null when the date isn't one of the Sundays
 * currently on the schedule, so writes can't target arbitrary dates.
 */
export async function getRequestedWeekState(
  date: string,
  settings: Settings,
  now: Date = new Date(),
): Promise<ComputedWeek | null> {
  if (!getScheduleWeeks(settings.scheduleWindowWeeks, now).includes(date)) {
    return null;
  }
  const override = await getWeekOverride(date);
  return computeWeekState({
    date,
    hasOverride: override?.status === "no_nexus",
    hasClaim: false,
    settings,
    now,
  });
}

export interface WeekViewWithSignup extends WeekView {
  signup?: Signup;
}

export async function getWeekViews(
  count: number,
  settings: Settings,
  overview: Overview,
  now: Date = new Date(),
): Promise<WeekViewWithSignup[]> {
  const dates = getScheduleWeeks(count, now);
  const [overrides, claims] = await Promise.all([
    getWeekOverrides(dates),
    getClaimSignupIds(dates),
  ]);
  const signupIds = Object.values(claims).filter((v): v is string => !!v);
  const signups = await getSignups(signupIds);
  const signupById = new Map(signups.map((s) => [s.id, s]));

  return dates.map((date) => {
    const override = overrides[date];
    const claimId = claims[date];
    const signup = claimId ? signupById.get(claimId) : undefined;
    const computed = computeWeekState({
      date,
      // Only a "No Nexus" status takes the week off the schedule. An override
      // doc that just carries an arrivalOverride is still a normal week.
      hasOverride: override?.status === "no_nexus",
      hasClaim: !!claimId,
      settings,
      now,
    });
    return {
      date,
      state: computed.state,
      color: computed.color,
      label: override?.label,
      meal: signup?.meal,
      arrivalTime: override?.arrivalOverride ?? overview.arrivalTime,
      signupId: claimId ?? undefined,
      signup,
    };
  });
}
