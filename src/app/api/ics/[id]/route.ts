import { NextRequest, NextResponse } from "next/server";
import { getOverview, getSettings } from "@/lib/settings";
import { getSignup, getWeekOverride } from "@/lib/signups";
import { buildIcsEvent } from "@/lib/calendar";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const signup = await getSignup(id);
  if (!signup || signup.purged) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [overview, settings, override] = await Promise.all([
    getOverview(),
    getSettings(),
    getWeekOverride(signup.date),
  ]);

  const ics = buildIcsEvent({
    date: signup.date,
    arrivalTime: override?.arrivalOverride ?? overview.arrivalTime,
    endTime: overview.endTime,
    readyTime: overview.readyTime,
    meal: signup.meal,
    address: settings.address,
    entrance: settings.entrance,
    pleaseBring: overview.pleaseBring.map((i) => i.label),
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="nexus-meal-${signup.date}.ics"`,
    },
  });
}
