import { NextRequest, NextResponse } from "next/server";
import {
  getClientIp,
  signupRatelimit,
  tooManyRequests,
} from "@/lib/ratelimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { signupSchema } from "@/lib/validation";
import { getSettings } from "@/lib/settings";
import { attemptClaimAndCreateSignup } from "@/lib/signups";
import { getRequestedWeekState } from "@/lib/weeks";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  const limit = await signupRatelimit.limit(ip);
  if (!limit.success) return tooManyRequests(limit.reset);

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const turnstileOk = await verifyTurnstile(data.turnstileToken, ip);
  if (!turnstileOk) {
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 400 },
    );
  }

  const settings = await getSettings();
  const week = await getRequestedWeekState(data.date, settings);
  if (!week || (week.state !== "open" && week.state !== "urgent")) {
    return NextResponse.json(
      { error: "That week is no longer available to sign up for." },
      { status: 400 },
    );
  }

  const result = await attemptClaimAndCreateSignup({
    date: data.date,
    name: data.name,
    email: data.email,
    phone: data.phone,
    meal: data.meal,
    createdBy: "public",
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "This week was just taken." },
      { status: 409 },
    );
  }

  return NextResponse.json({ id: result.signup.id });
}
