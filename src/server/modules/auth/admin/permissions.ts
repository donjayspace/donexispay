import "server-only";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "./session";
import type { AdminRole } from "./types";

export type AdminPermission =
  | "overview" | "merchants" | "payments" | "events" | "refunds"
  | "settlements" | "reconciliation" | "risk" | "users" | "audit"
  | "billing" | "providers" | "settings" | "administrators";

const grants: Record<AdminPermission, readonly AdminRole[]> = {
  overview: ["SUPPORT", "OPERATIONS", "ADMIN", "SUPER_ADMIN"],
  merchants: ["SUPPORT", "OPERATIONS", "ADMIN", "SUPER_ADMIN"],
  payments: ["OPERATIONS", "ADMIN", "SUPER_ADMIN"],
  events: ["OPERATIONS", "ADMIN", "SUPER_ADMIN"],
  refunds: ["OPERATIONS", "ADMIN", "SUPER_ADMIN"],
  settlements: ["OPERATIONS", "ADMIN", "SUPER_ADMIN"],
  reconciliation: ["OPERATIONS", "ADMIN", "SUPER_ADMIN"],
  risk: ["OPERATIONS", "ADMIN", "SUPER_ADMIN"],
  users: ["SUPPORT", "ADMIN", "SUPER_ADMIN"],
  audit: ["ADMIN", "SUPER_ADMIN"],
  billing: ["ADMIN", "SUPER_ADMIN"],
  providers: ["ADMIN", "SUPER_ADMIN"],
  settings: ["ADMIN", "SUPER_ADMIN"],
  administrators: ["SUPER_ADMIN"],
};

export function canAdminAccess(role: AdminRole, permission: AdminPermission) {
  return grants[permission].includes(role);
}

/** Enforce role permissions in the server page/service, not just in navigation UI. */
export async function requireAdminPermission(permission: AdminPermission) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  if (!canAdminAccess(admin.role, permission)) redirect("/admin?error=forbidden");
  return admin;
}
