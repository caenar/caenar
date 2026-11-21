import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const SESSION_PAYLOAD = "portfolio-admin-session";

function getAdminSecret() {
  return process.env.ADMIN_SECRET?.trim() || "";
}

function expectedToken(secret: string) {
  return createHmac("sha256", secret).update(SESSION_PAYLOAD).digest("hex");
}

export function isAdminAuthConfigured() {
  return getAdminSecret().length > 0;
}

export function verifyAdminSecret(input: string) {
  const secret = getAdminSecret();
  if (!secret) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function isAdminAuthenticated() {
  const secret = getAdminSecret();
  if (!secret) return process.env.NODE_ENV !== "production";
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const expected = expectedToken(secret);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function setAdminSession() {
  const secret = getAdminSecret();
  if (!secret) throw new Error("ADMIN_SECRET is not configured");
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, expectedToken(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function requireAdmin() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    throw new Error("Unauthorized");
  }
}
