import Link from "next/link";

type RegisterPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  provider_unavailable: "That sign-up provider is not configured yet. Please try another option or contact the workspace administrator.",
  oauth_canceled: "Sign-up was canceled. You can try again whenever you're ready.",
  oauth_state_invalid: "This sign-up request expired or could not be verified. Please start again.",
  account_conflict: "An account already uses this email with another sign-in method. Sign in with the provider you originally used.",
  oauth_failed: "We couldn't complete registration. Please try again.",
};

function ProviderButton({ provider, label, icon }: { provider: "google" | "github"; label: string; icon: string }) {
  return <a className="oauth-button" href={`/api/auth/${provider}`}><span className="oauth-provider-icon" aria-hidden="true">{icon}</span><span>{label}</span><span className="oauth-button-arrow" aria-hidden="true">→</span></a>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error } = await searchParams;
  const message = error ? errorMessages[error] : undefined;

  return (
    <main className="auth-page">
      <section className="auth-story">
        <Link className="brand-lockup" href="/"><span className="brand-mark" aria-hidden="true">D</span><span>donexis<span className="brand-accent">pay</span></span></Link>
        <div><p className="section-kicker">A clearer way to manage payments</p><h1>Your payment workspace starts here.</h1><p>Create an account to prepare merchant onboarding, configure integrations, and manage your payment operations when services are enabled.</p></div>
        <p className="auth-note">Registration creates a user account only. Merchant verification and provider approval are separate steps.</p>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form">
          <p className="section-kicker">Get started</p>
          <h2>Create your DonexisPay account</h2>
          <p>Choose a verified identity provider. If this is your first sign-in, we&apos;ll create your account automatically.</p>
          {message ? <div className="auth-error" role="alert">{message}</div> : null}
          <div className="oauth-provider-buttons">
            <ProviderButton provider="google" label="Sign up with Google" icon="G" />
            <ProviderButton provider="github" label="Sign up with GitHub" icon="GH" />
          </div>
          <div className="auth-divider"><span>What happens next?</span></div>
          <ul className="auth-benefits">
            <li><span aria-hidden="true">✓</span><span><strong>Verified email</strong><small>We require the identity provider to confirm your email address.</small></span></li>
            <li><span aria-hidden="true">✓</span><span><strong>Protected session</strong><small>Your session uses a secure, HTTP-only cookie and a hashed database token.</small></span></li>
            <li><span aria-hidden="true">✓</span><span><strong>Workspace setup</strong><small>Complete business onboarding separately before connecting a provider.</small></span></li>
          </ul>
          <div className="form-foot">Already registered? <Link href="/login" style={{ color: "#405ce5", fontWeight: 700 }}>Sign in</Link></div>
          <div className="form-foot"><Link href="/" style={{ color: "#667085", fontWeight: 600 }}>← Back to homepage</Link></div>
        </div>
      </section>
    </main>
  );
}
