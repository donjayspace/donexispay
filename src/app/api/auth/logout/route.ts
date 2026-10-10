import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/server/infrastructure/database/prisma";
import { AUTH_SESSION_COOKIE, hashOpaqueToken, secureCookieOptions } from "@/server/modules/auth/oauth-state";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
  if (token && token.length <= 128) {
    await prisma.authSession.updateMany({
      where: { tokenHash: hashOpaqueToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  const response = NextResponse.redirect(new URL("/login", env.APP_URL), { status: 303 });
  response.cookies.set(AUTH_SESSION_COOKIE, "", { ...secureCookieOptions(0), expires: new Date(0) });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
