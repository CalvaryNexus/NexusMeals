import { nanoid } from "nanoid";
import { redis } from "./redis";
import { chicagoTodayYMD, daysBetweenYMD } from "./schedule";
import type { Signup, WeekOverride } from "./types";

function sundayScore(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Date.UTC(y, m - 1, d, 12);
}

export async function getWeekOverride(
  date: string,
): Promise<WeekOverride | null> {
  return redis.get<WeekOverride>(`week:${date}`);
}

export async function getWeekOverrides(
  dates: string[],
): Promise<Record<string, WeekOverride | null>> {
  if (dates.length === 0) return {};
  const keys = dates.map((d) => `week:${d}`);
  const values = await redis.mget<(WeekOverride | null)[]>(...keys);
  const result: Record<string, WeekOverride | null> = {};
  dates.forEach((d, i) => {
    result[d] = values[i] ?? null;
  });
  return result;
}

export async function setWeekOverride(
  date: string,
  override: WeekOverride,
): Promise<void> {
  await redis.set(`week:${date}`, override);
}

export async function clearWeekOverride(date: string): Promise<void> {
  await redis.del(`week:${date}`);
}

export async function getClaimSignupId(date: string): Promise<string | null> {
  return redis.get<string>(`claim:${date}`);
}

export async function getClaimSignupIds(
  dates: string[],
): Promise<Record<string, string | null>> {
  if (dates.length === 0) return {};
  const keys = dates.map((d) => `claim:${d}`);
  const values = await redis.mget<(string | null)[]>(...keys);
  const result: Record<string, string | null> = {};
  dates.forEach((d, i) => {
    result[d] = values[i] ?? null;
  });
  return result;
}

/** Atomic claim of a week. Returns true if this call won the claim. */
export async function claimWeek(
  date: string,
  signupId: string,
): Promise<boolean> {
  const res = await redis.set(`claim:${date}`, signupId, { nx: true });
  return res === "OK";
}

export async function releaseClaim(date: string): Promise<void> {
  await redis.del(`claim:${date}`);
}

export interface CreateSignupInput {
  date: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  meal: string;
  createdBy: string;
}

async function persistSignup(signup: Signup): Promise<Signup> {
  await redis.set(`signup:${signup.id}`, signup);
  await redis.zadd("signups:by-date", {
    score: sundayScore(signup.date),
    member: signup.id,
  });
  return signup;
}

export async function createSignup(input: CreateSignupInput): Promise<Signup> {
  const signup: Signup = {
    id: nanoid(12),
    date: input.date,
    name: input.name,
    email: input.email,
    phone: input.phone,
    meal: input.meal,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
    reminderSent: false,
    purged: false,
  };
  return persistSignup(signup);
}

/**
 * Wins the week's claim lock and only then creates the signup record, so a lost
 * race never leaves an orphaned signup with no claim.
 */
export async function attemptClaimAndCreateSignup(
  input: CreateSignupInput,
): Promise<{ ok: true; signup: Signup } | { ok: false }> {
  const id = nanoid(12);
  const won = await claimWeek(input.date, id);
  if (!won) return { ok: false };
  const signup: Signup = {
    id,
    date: input.date,
    name: input.name,
    email: input.email,
    phone: input.phone,
    meal: input.meal,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
    reminderSent: false,
    purged: false,
  };
  await persistSignup(signup);
  return { ok: true, signup };
}

export async function getSignup(id: string): Promise<Signup | null> {
  return redis.get<Signup>(`signup:${id}`);
}

export async function getSignups(ids: string[]): Promise<Signup[]> {
  if (ids.length === 0) return [];
  const keys = ids.map((id) => `signup:${id}`);
  const values = await redis.mget<(Signup | null)[]>(...keys);
  return values.filter((s): s is Signup => s !== null);
}

export async function updateSignup(
  id: string,
  patch: Partial<Signup>,
): Promise<Signup | null> {
  const existing = await getSignup(id);
  if (!existing) return null;
  const updated: Signup = { ...existing, ...patch };
  await redis.set(`signup:${id}`, updated);
  return updated;
}

export async function deleteSignup(id: string): Promise<void> {
  const signup = await getSignup(id);
  await redis.del(`signup:${id}`);
  await redis.zrem("signups:by-date", id);
  if (signup) {
    await releaseClaim(signup.date);
  }
}

export async function listSignupsByDateRange(
  fromDate: string,
  toDate: string,
): Promise<Signup[]> {
  const min = sundayScore(fromDate);
  const max = sundayScore(toDate);
  const ids = await redis.zrange<string[]>("signups:by-date", min, max, {
    byScore: true,
  });
  return getSignups(ids);
}

export async function listAllSignups(): Promise<Signup[]> {
  const ids = await redis.zrange<string[]>("signups:by-date", 0, -1);
  return getSignups(ids);
}

export async function listPastSignups(beforeDate: string): Promise<Signup[]> {
  const max = sundayScore(beforeDate) - 1;
  const ids = await redis.zrange<string[]>("signups:by-date", 0, max, {
    byScore: true,
  });
  return getSignups(ids);
}

export async function addToNeedsContact(id: string): Promise<void> {
  await redis.sadd("needs-contact", id);
}

export async function removeFromNeedsContact(id: string): Promise<void> {
  await redis.srem("needs-contact", id);
}

export async function listNeedsContact(): Promise<Signup[]> {
  const ids = await redis.smembers("needs-contact");
  return getSignups(ids);
}

export async function purgeOldSignups(retentionDays: number): Promise<number> {
  const today = chicagoTodayYMD();
  const candidates = await listPastSignups(today);
  let purgedCount = 0;
  for (const signup of candidates) {
    if (signup.purged) continue;
    if (daysBetweenYMD(signup.date, today) <= retentionDays) continue;
    await updateSignup(signup.id, {
      name: null,
      email: null,
      phone: null,
      purged: true,
    });
    purgedCount++;
  }
  return purgedCount;
}

export async function getSignupsForDates(dates: string[]): Promise<
  Record<string, Signup | null>
> {
  const claims = await getClaimSignupIds(dates);
  const ids = Object.values(claims).filter((v): v is string => !!v);
  const signups = await getSignups(ids);
  const byId = new Map(signups.map((s) => [s.id, s]));
  const result: Record<string, Signup | null> = {};
  for (const date of dates) {
    const claimId = claims[date];
    result[date] = claimId ? (byId.get(claimId) ?? null) : null;
  }
  return result;
}
