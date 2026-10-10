import type { ReactNode } from "react";
import { requireUser } from "@/server/modules/auth";

export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  await requireUser();
  return children;
}
