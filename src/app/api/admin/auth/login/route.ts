import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { authenticateAdmin, createAdminSession, ADMIN_SESSION_COOKIE, adminSessionCookieOptions } from "@/server/modules/auth/admin";
import { clearAdminLoginFailures, isAdminLoginBlocked, recordAdminLoginFailure } from "@/server/modules/auth/admin/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== env.APP_URL.replace(/\/$/, "")) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid_request", env.APP_URL), 303);
  }

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.redirect(new URL("/admin/login?error=invalid_request", env.APP_URL), 303);
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!email || email.length > 320 || !password || password.length > 1024) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid_credentials", env.APP_URL), 303);
  }
  if (await isAdminLoginBlocked(email)) {
    return NextResponse.redirect(new URL("/admin/login?error=try_later", env.APP_URL), 303);
  }

  try {
    const admin = await authenticateAdmin(email, password);
    if (!admin) {
      await recordAdminLoginFailure(email);
      return NextResponse.redirect(new URL("/admin/login?error=invalid_credentials", env.APP_URL), 303);
    }

    await clearAdminLoginFailures(email);
    const session = await createAdminSession(admin.id);
    const response = NextResponse.redirect(new URL("/admin", env.APP_URL), 303);
    response.cookies.set(ADMIN_SESSION_COOKIE, session.token, adminSessionCookieOptions(session.expiresAt));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Admin login failed", { errorType: error instanceof Error ? error.name : "UnknownError" });
    return NextResponse.redirect(new URL("/admin/login?error=temporarily_unavailable", env.APP_URL), 303);
  }
}
