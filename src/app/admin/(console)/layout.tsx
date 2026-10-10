import type { ReactNode } from "react";
import { requireAdmin } from "@/server/modules/auth/admin";
import { AdminShell } from "@/components/layouts/admin-shell";

/** Every console route is protected server-side before its page is rendered. */
export default async function AdminConsoleLayout({ children }: Readonly<{ children: ReactNode }>) {
  const admin = await requireAdmin();
  return <AdminShell admin={admin}>{children}</AdminShell>;
}
