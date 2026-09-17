import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { purgeOldSignups } from "@/lib/signups";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const settings = await getSettings();
  const purgedCount = await purgeOldSignups(settings.retentionDays);

  return NextResponse.json({ ok: true, purgedCount });
}
