import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/server/infrastructure/database/prisma";
import { ADMIN_SESSION_COOKIE } from "@/server/modules/auth/admin";
import { hashOpaqueToken, secureCookieOptions } from "@/server/modules/auth/oauth-state";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Only same-origin logout forms are accepted; logout never performs another action.
  const origin = request.headers.get("origin");
  if (origin && origin !== env.APP_URL.replace(/\/$/, "")) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (token && token.length <= 128) {
    await prisma.adminSession.updateMany({
      where: { tokenHash: hashOpaqueToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  const response = NextResponse.redirect(new URL("/admin/login", env.APP_URL), 303);
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { ...secureCookieOptions(0), expires: new Date(0) });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
