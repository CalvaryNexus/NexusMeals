import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { purgeOldSignups } from "@/lib/signups";

function isAuthorized(header: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  // Fail closed: with no secret configured, nobody may trigger the job.
  if (!secret || !header) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getSettings();
  const purgedCount = await purgeOldSignups(settings.retentionDays);

  return NextResponse.json({ ok: true, purgedCount });
}
