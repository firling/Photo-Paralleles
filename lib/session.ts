import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * Session layer for the back-office. A single admin signs in; the session is a
 * short JWT (HS256, `jose`) stored in an httpOnly cookie. Payload is minimal:
 * `{ sub: adminId, email }`. Secret comes from `JWT_SECRET`.
 */

const COOKIE_NAME = "pp_session";
const TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

export interface SessionPayload {
  sub: string;
  email: string;
}

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set — cannot sign/verify sessions.");
  }
  return new TextEncoder().encode(secret);
}

async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(secretKey());
}

function toSession(claims: JWTPayload): SessionPayload | null {
  if (typeof claims.sub === "string" && typeof claims.email === "string") {
    return { sub: claims.sub, email: claims.email };
  }
  return null;
}

/** Create the session cookie after a successful credential check. */
export async function startSession(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

/** Clear the session cookie (logout). */
export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Read + verify the current session, or null if absent/invalid/expired. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return toSession(payload);
  } catch {
    return null;
  }
}
