import { NextRequest, NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/apiAuth";
import { settingsSchema } from "@/lib/validation";
import { setSettings } from "@/lib/settings";

export async function PUT(req: NextRequest) {
  const auth = await requireOwnerApi();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  await setSettings(parsed.data);
  return NextResponse.json({ ok: true });
}
