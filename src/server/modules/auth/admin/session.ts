import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/server/infrastructure/database/prisma";
import { createOpaqueToken, hashOpaqueToken, secureCookieOptions } from "../oauth-state";
import type { AuthenticatedAdmin } from "./types";

export const ADMIN_SESSION_COOKIE = "donexispay_admin_session";
const ADMIN_SESSION_DURATION_MS = 1000 * 60 * 60 * 8;

/** Creates an independent admin session; customer OAuth sessions cannot authenticate here. */
export async function createAdminSession(adminId: string) {
  const token = createOpaqueToken();
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_DURATION_MS);
  await prisma.adminSession.create({ data: { adminId, tokenHash: hashOpaqueToken(token), expiresAt } });
  return { token, expiresAt };
}

export async function getCurrentAdmin(): Promise<AuthenticatedAdmin | null> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token || token.length > 128) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashOpaqueToken(token) },
    include: { admin: true },
  });
  if (!session || session.revokedAt || session.expiresAt <= new Date() || session.admin.disabledAt) return null;

  return {
    id: session.admin.id,
    email: session.admin.email,
    displayName: session.admin.displayName,
    role: session.admin.role,
  };
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export function adminSessionCookieOptions(expiresAt: Date) {
  return { ...secureCookieOptions(ADMIN_SESSION_DURATION_MS / 1000), expires: expiresAt };
}
