import { NextRequest, NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/apiAuth";
import { deleteAdmin, setAdminDisabled } from "@/lib/auth";
import { z } from "zod";

const patchSchema = z.object({ disabled: z.boolean() });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireOwnerApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  await setAdminDisabled(id, parsed.data.disabled);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireOwnerApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  if (id === auth.admin.id) {
    return NextResponse.json(
      { error: "You can't delete your own account." },
      { status: 400 },
    );
  }
  await deleteAdmin(id);
  return NextResponse.json({ ok: true });
}
