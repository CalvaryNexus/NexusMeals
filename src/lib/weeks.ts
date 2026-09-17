import { computeWeekState, getScheduleWeeks } from "./schedule";
import { getClaimSignupIds, getSignups, getWeekOverrides } from "./signups";
import type { Overview, Settings, Signup, WeekView } from "./types";

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
      hasOverride: !!override,
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
