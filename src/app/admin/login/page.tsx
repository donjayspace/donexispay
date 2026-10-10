import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/server/modules/auth/admin";

type Props = { searchParams: Promise<{ error?: string }> };

const messages: Record<string, string> = {
  invalid_request: "This sign-in request could not be verified. Refresh the page and try again.",
  invalid_credentials: "The email or password is incorrect.",
  try_later: "Too many attempts. Wait 15 minutes before trying again.",
  temporarily_unavailable: "Sign-in is temporarily unavailable. Please try again shortly.",
};

export default async function AdminLoginPage({ searchParams }: Props) {
  if (await getCurrentAdmin()) redirect("/admin");
  const { error } = await searchParams;
  const message = error ? messages[error] : undefined;

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <Link className="brand-lockup" href="/"><span className="brand-mark" aria-hidden="true">D</span><span>donexis<span className="brand-accent">pay</span></span></Link>
        <p className="section-kicker" style={{ marginTop: 34 }}>Restricted access</p>
        <h1>Administrator sign in</h1>
        <p className="admin-login-intro">Use your separately provisioned administrator credentials. Customer Google and GitHub accounts cannot access this console.</p>
        {message ? <div className="auth-error" role="alert">{message}</div> : null}
        <form className="admin-login-form" method="post" action="/api/admin/auth/login">
          <label htmlFor="email">Work email</label>
          <input id="email" name="email" type="email" autoComplete="username" maxLength={320} required />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" maxLength={1024} required />
          <button className="button button-primary" type="submit">Sign in securely <span aria-hidden="true">→</span></button>
        </form>
        <p className="admin-login-foot">Access is logged and rate-limited. If you need access, contact your platform administrator.</p>
        <Link className="admin-login-back" href="/">← Return to DonexisPay</Link>
      </section>
    </main>
  );
}
