import { NextRequest, NextResponse } from "next/server";
import { getClientIp, signupRatelimit } from "@/lib/ratelimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { signupSchema } from "@/lib/validation";
import { getSettings } from "@/lib/settings";
import { getWeekOverride } from "@/lib/signups";
import { attemptClaimAndCreateSignup } from "@/lib/signups";
import { computeWeekState } from "@/lib/schedule";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  const { success } = await signupRatelimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

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
  const override = await getWeekOverride(data.date);
  const computed = computeWeekState({
    date: data.date,
    hasOverride: !!override,
    hasClaim: false,
    settings,
  });
  if (computed.state !== "open" && computed.state !== "urgent") {
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
