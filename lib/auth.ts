import "server-only";
import { redirect } from "next/navigation";
import { verify } from "@node-rs/argon2";
import type { AdminUser } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession, type SessionPayload } from "@/lib/session";

/**
 * Authentication helpers for the single back-office admin. Passwords are hashed
 * with argon2 (seeded). `requireAdmin()` guards the protected layout.
 */

export type SafeAdmin = Pick<AdminUser, "id" | "email">;

/** Verify an email/password pair; returns the admin id+email on success. */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<SafeAdmin | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) return null;

  const admin = await prisma.adminUser.findUnique({
    where: { email: normalized },
  });
  if (!admin) return null;

  let ok = false;
  try {
    ok = await verify(admin.passwordHash, password);
  } catch {
    ok = false;
  }
  if (!ok) return null;

  return { id: admin.id, email: admin.email };
}

/**
 * Load the admin behind the current session. Returns null if there is no valid
 * session or the referenced admin no longer exists.
 */
export async function getCurrentAdmin(): Promise<SafeAdmin | null> {
  const session: SessionPayload | null = await getSession();
  if (!session) return null;
  const admin = await prisma.adminUser.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true },
  });
  return admin;
}

/**
 * Guard for protected pages/actions. Redirects to the login page when there is
 * no valid session; otherwise returns the admin.
 */
export async function requireAdmin(): Promise<SafeAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  return admin;
}
