import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/infrastructure/database/prisma";
import type { AuthenticatedUser, OAuthIdentity } from "./types";
import { createOpaqueToken, hashOpaqueToken } from "./oauth-state";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

export class OAuthAccountConflictError extends Error {
  constructor() {
    super("An account already exists for this email. Sign in with the provider previously used for this account.");
    this.name = "OAuthAccountConflictError";
  }
}

export async function resolveOAuthUser(identity: OAuthIdentity): Promise<AuthenticatedUser> {
  if (!identity.emailVerified) throw new Error("The identity provider did not verify this email address.");
  const email = identity.email.trim().toLowerCase();
  if (!email || email.length > 320) throw new Error("The provider returned an invalid email address.");

  const existingAccount = await prisma.oAuthAccount.findUnique({
    where: { provider_providerAccountId: { provider: identity.provider, providerAccountId: identity.providerAccountId } },
    include: { user: true },
  });
  if (existingAccount) {
    if (existingAccount.user.disabledAt) throw new Error("This account is not available.");
    return {
      id: existingAccount.user.id,
      email: existingAccount.user.email,
      name: existingAccount.user.name,
      image: existingAccount.user.image,
      role: "USER",
    };
  }

  const emailOwner = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (emailOwner) throw new OAuthAccountConflictError();

  try {
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          name: identity.name?.trim().slice(0, 160) || null,
          image: identity.image,
          emailVerified: new Date(),
        },
      });
      await tx.oAuthAccount.create({
        data: {
          userId: createdUser.id,
          provider: identity.provider,
          providerAccountId: identity.providerAccountId,
        },
      });
      await tx.auditLog.create({
        data: {
          actorType: "USER",
          actorId: createdUser.id,
          action: "AUTH_REGISTER_OAUTH",
          targetType: "USER",
          targetId: createdUser.id,
          outcome: "SUCCESS",
          metadata: { provider: identity.provider },
        },
      });
      return createdUser;
    });
    return { id: user.id, email: user.email, name: user.name, image: user.image, role: "USER" };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const racedAccount = await prisma.oAuthAccount.findUnique({
        where: { provider_providerAccountId: { provider: identity.provider, providerAccountId: identity.providerAccountId } },
        include: { user: true },
      });
      if (racedAccount && !racedAccount.user.disabledAt) {
        return {
          id: racedAccount.user.id,
          email: racedAccount.user.email,
          name: racedAccount.user.name,
          image: racedAccount.user.image,
          role: "USER",
        };
      }
      throw new OAuthAccountConflictError();
    }
    throw error;
  }
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = createOpaqueToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const tokenHash = hashOpaqueToken(token);
  await prisma.$transaction([
    prisma.authSession.create({ data: { userId, tokenHash, expiresAt } }),
    prisma.auditLog.create({
      data: {
        actorType: "USER",
        actorId: userId,
        action: "AUTH_LOGIN_OAUTH",
        targetType: "USER",
        targetId: userId,
        outcome: "SUCCESS",
      },
    }),
  ]);
  return { token, expiresAt };
}
