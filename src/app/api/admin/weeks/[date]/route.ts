import { NextRequest, NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/apiAuth";
import {
  addToNeedsContact,
  clearWeekOverride,
  getClaimSignupId,
  getWeekOverride,
  releaseClaim,
  setWeekOverride,
} from "@/lib/signups";
import { z } from "zod";

const patchSchema = z.object({
  noNexus: z.boolean().optional(),
  label: z.string().trim().max(200).optional(),
  arrivalOverride: z
    .union([z.string().regex(/^\d{2}:\d{2}$/), z.null()])
    .optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ date: string }> },
) {
  const auth = await requireOwnerApi();
  if (!auth.ok) return auth.response;
  const { date } = await params;
  const [override, claimId] = await Promise.all([
    getWeekOverride(date),
    getClaimSignupId(date),
  ]);
  return NextResponse.json({ override, hasClaim: !!claimId });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> },
) {
  const auth = await requireOwnerApi();
  if (!auth.ok) return auth.response;
  const { date } = await params;

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }
  const { noNexus, label, arrivalOverride } = parsed.data;

  const existing = (await getWeekOverride(date)) ?? {};
  const next = { ...existing };

  if (noNexus === true) {
    const claimId = await getClaimSignupId(date);
    if (claimId) {
      await addToNeedsContact(claimId);
      await releaseClaim(date);
    }
    next.status = "no_nexus";
    if (label !== undefined) next.label = label;
  } else if (noNexus === false) {
    delete next.status;
    delete next.label;
  } else if (label !== undefined) {
    next.label = label;
  }

  if (arrivalOverride !== undefined) {
    if (arrivalOverride === null) {
      delete next.arrivalOverride;
    } else {
      next.arrivalOverride = arrivalOverride;
    }
  }

  if (Object.keys(next).length === 0) {
    await clearWeekOverride(date);
  } else {
    await setWeekOverride(date, next);
  }

  return NextResponse.json({ override: next });
}
