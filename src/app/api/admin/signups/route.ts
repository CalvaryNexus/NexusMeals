import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/session";
import { manualSignupSchema } from "@/lib/validation";
import { getSettings } from "@/lib/settings";
import { attemptClaimAndCreateSignup } from "@/lib/signups";
import { getRequestedWeekState } from "@/lib/weeks";

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = manualSignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const settings = await getSettings();
  const week = await getRequestedWeekState(data.date, settings);
  if (!week) {
    return NextResponse.json(
      { error: "That date isn't a Sunday on the current schedule." },
      { status: 400 },
    );
  }
  if (week.state === "no_nexus") {
    return NextResponse.json(
      { error: "That week is marked No Nexus." },
      { status: 400 },
    );
  }

  const result = await attemptClaimAndCreateSignup({
    date: data.date,
    name: data.name,
    email: data.email,
    phone: data.phone,
    meal: data.meal,
    createdBy: admin.id,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "That week is already claimed." },
      { status: 409 },
    );
  }

  return NextResponse.json({ id: result.signup.id });
}
