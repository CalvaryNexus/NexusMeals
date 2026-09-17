import { NextRequest, NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/apiAuth";
import { overviewSchema } from "@/lib/validation";
import { setOverview } from "@/lib/settings";
import { sanitizeRichText } from "@/lib/sanitize";

export async function PUT(req: NextRequest) {
  const auth = await requireOwnerApi();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = overviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const data = parsed.data;
  await setOverview({
    ...data,
    whatTeensLike: sanitizeRichText(data.whatTeensLike),
    teamingUpNote: sanitizeRichText(data.teamingUpNote),
  });

  return NextResponse.json({ ok: true });
}
