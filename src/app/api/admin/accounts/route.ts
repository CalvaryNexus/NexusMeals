import { NextRequest, NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/apiAuth";
import { createAccountSchema } from "@/lib/validation";
import { createAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const auth = await requireOwnerApi();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = createAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  try {
    const admin = await createAdmin(
      parsed.data.email,
      parsed.data.password,
      parsed.data.role,
    );
    return NextResponse.json({ id: admin.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not create account." },
      { status: 400 },
    );
  }
}
