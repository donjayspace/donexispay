/** Administrator identity types intentionally do not reuse customer OAuth users. */
export type AdminRole = "SUPPORT" | "OPERATIONS" | "ADMIN" | "SUPER_ADMIN";

export type AuthenticatedAdmin = {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
};
