"use server";

import { redirect } from "next/navigation";
import { verifyCredentials } from "@/lib/auth";
import { startSession } from "@/lib/session";

/**
 * Login Server Action. Validates credentials, opens a session, redirects to the
 * dashboard. Returns an error state (consumed via `useActionState`) on failure.
 * Includes a light in-memory rate limit per email to slow brute-forcing.
 */

export interface LoginState {
  error?: string;
}

const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Renseignez votre email et votre mot de passe." };
  }

  if (rateLimited(email.toLowerCase())) {
    return { error: "Trop de tentatives. Réessayez dans quelques minutes." };
  }

  const admin = await verifyCredentials(email, password);
  if (!admin) {
    return { error: "Identifiants invalides." };
  }

  attempts.delete(email.toLowerCase());
  await startSession({ sub: admin.id, email: admin.email });
  redirect("/admin");
}
