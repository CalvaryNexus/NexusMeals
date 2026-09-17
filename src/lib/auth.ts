import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { redis } from "./redis";
import type { Admin, AdminRole } from "./types";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const SESSION_COOKIE = "nexus_session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const id = await redis.get<string>(`admin:email:${email.toLowerCase()}`);
  if (!id) return null;
  return redis.get<Admin>(`admin:${id}`);
}

export async function getAdminById(id: string): Promise<Admin | null> {
  return redis.get<Admin>(`admin:${id}`);
}

export async function createAdmin(
  email: string,
  password: string,
  role: AdminRole,
): Promise<Admin> {
  const existing = await getAdminByEmail(email);
  if (existing) {
    throw new Error("An account with that email already exists.");
  }
  const admin: Admin = {
    id: nanoid(12),
    email: email.toLowerCase(),
    passwordHash: await hashPassword(password),
    role,
    disabled: false,
    createdAt: new Date().toISOString(),
  };
  await redis.set(`admin:${admin.id}`, admin);
  await redis.set(`admin:email:${admin.email}`, admin.id);
  return admin;
}

export async function listAdmins(): Promise<Admin[]> {
  const keys: string[] = [];
  let cursor = "0";
  do {
    const [next, batch] = await redis.scan(cursor, {
      match: "admin:*",
      count: 100,
    });
    cursor = next;
    for (const key of batch) {
      if (!key.startsWith("admin:email:")) keys.push(key);
    }
  } while (cursor !== "0");
  if (keys.length === 0) return [];
  const values = await redis.mget<(Admin | null)[]>(...keys);
  return values.filter((a): a is Admin => a !== null);
}

export async function setAdminDisabled(
  id: string,
  disabled: boolean,
): Promise<void> {
  const admin = await getAdminById(id);
  if (!admin) return;
  admin.disabled = disabled;
  await redis.set(`admin:${id}`, admin);
}

export async function deleteAdmin(id: string): Promise<void> {
  const admin = await getAdminById(id);
  if (!admin) return;
  await redis.del(`admin:${id}`);
  await redis.del(`admin:email:${admin.email}`);
}

export async function seedOwnerIfNeeded(): Promise<void> {
  const ownerEmail = process.env.OWNER_EMAIL;
  const ownerPassword = process.env.OWNER_PASSWORD;
  if (!ownerEmail || !ownerPassword) return;
  const existing = await getAdminByEmail(ownerEmail);
  if (existing) return;
  const admins = await listAdmins();
  if (admins.length > 0) return;
  await createAdmin(ownerEmail, ownerPassword, "owner");
}

export async function createSession(adminId: string): Promise<string> {
  const token = nanoid(32);
  await redis.set(`session:${token}`, adminId, { ex: SESSION_TTL_SECONDS });
  return token;
}

export async function getSessionAdmin(token: string | undefined): Promise<Admin | null> {
  if (!token) return null;
  const adminId = await redis.get<string>(`session:${token}`);
  if (!adminId) return null;
  const admin = await getAdminById(adminId);
  if (!admin || admin.disabled) return null;
  return admin;
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return;
  await redis.del(`session:${token}`);
}

export { SESSION_TTL_SECONDS };
