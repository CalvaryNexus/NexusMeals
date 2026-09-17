import { NextResponse } from "next/server";
import { getCurrentAdmin } from "./session";
import type { Admin } from "./types";

type AuthResult =
  | { ok: true; admin: Admin }
  | { ok: false; response: NextResponse };

export async function requireAdminApi(): Promise<AuthResult> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not authenticated." }, { status: 401 }),
    };
  }
  return { ok: true, admin };
}

export async function requireOwnerApi(): Promise<AuthResult> {
  const result = await requireAdminApi();
  if (!result.ok) return result;
  if (result.admin.role !== "owner") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Owner access required." }, { status: 403 }),
    };
  }
  return result;
}
