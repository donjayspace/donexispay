export type OAuthProvider = "google" | "github";

export type OAuthIdentity = {
  provider: OAuthProvider;
  providerAccountId: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: boolean;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: "USER";
};
