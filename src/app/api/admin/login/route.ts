import { NextRequest, NextResponse } from "next/server";
import { getClientIp, loginAccountRatelimit, loginIpRatelimit } from "@/lib/ratelimit";
import { loginSchema } from "@/lib/validation";
import { createSession, getAdminByEmail, verifyPassword, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  const ipLimit = await loginIpRatelimit.limit(ip);
  if (!ipLimit.success) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const accountLimit = await loginAccountRatelimit.limit(email.toLowerCase());
  if (!accountLimit.success) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  const admin = await getAdminByEmail(email);
  if (!admin || admin.disabled) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = await createSession(admin.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}
