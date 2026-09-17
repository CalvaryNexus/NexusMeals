import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/session";
import {
  deleteSignup,
  getSignup,
  removeFromNeedsContact,
  updateSignup,
} from "@/lib/signups";
import { usPhoneSchema } from "@/lib/validation";
import { z } from "zod";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().max(200).optional(),
  phone: usPhoneSchema.optional(),
  meal: z.string().trim().min(1).max(280).optional(),
  reminderSent: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const { id } = await params;
  const existing = await getSignup(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const updated = await updateSignup(id, {
    ...parsed.data,
    updatedBy: admin.id,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ signup: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const { id } = await params;
  await removeFromNeedsContact(id);
  await deleteSignup(id);
  return NextResponse.json({ ok: true });
}
