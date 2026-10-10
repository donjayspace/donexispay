import Link from "next/link";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  provider_unavailable: "That sign-in provider is not configured yet. Add its OAuth credentials to the server environment.",
  oauth_canceled: "Sign-in was canceled. You can try again whenever you're ready.",
  oauth_state_invalid: "This sign-in request expired or could not be verified. Please start again.",
  account_conflict: "An account already uses this email with another sign-in method. Sign in with the provider you originally used; accounts are not automatically linked.",
  oauth_failed: "We couldn't complete sign-in. Please try again.",
};

function ProviderButton({ provider, label, icon }: { provider: "google" | "github"; label: string; icon: string }) {
  return <a className="oauth-button" href={`/api/auth/${provider}`}><span className="oauth-provider-icon" aria-hidden="true">{icon}</span><span>{label}</span><span className="oauth-button-arrow" aria-hidden="true">→</span></a>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const message = error ? errorMessages[error] : undefined;

  return (
    <main className="auth-page">
      <section className="auth-story">
        <Link className="brand-lockup" href="/"><span className="brand-mark" aria-hidden="true">D</span><span>donexis<span className="brand-accent">pay</span></span></Link>
        <div><p className="section-kicker">Your payment workspace</p><h1>More clarity behind every transaction.</h1><p>Manage checkout, review payment activity, and prepare your integrations from one considered workspace.</p></div>
        <p className="auth-note">Secure-by-design architecture. Live payment processing is not enabled in this preview.</p>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form">
          <p className="section-kicker">Welcome back</p>
          <h2>Sign in to DonexisPay</h2>
          <p>Continue securely using a verified account with one of our supported identity providers.</p>
          {message ? <div className="auth-error" role="alert">{message}</div> : null}
          <div className="oauth-provider-buttons">
            <ProviderButton provider="google" label="Continue with Google" icon="G" />
            <ProviderButton provider="github" label="Continue with GitHub" icon="GH" />
          </div>
          <div className="auth-divider"><span>Secure account access</span></div>
          <p className="auth-legal">By continuing, you confirm you are authorized to use this workspace. Your provider verifies your identity; DonexisPay never receives your provider password.</p>
          <div className="form-foot">New to DonexisPay? <Link href="/register" style={{ color: "#405ce5", fontWeight: 700 }}>Create an account</Link></div>
          <div className="form-foot"><Link href="/" style={{ color: "#667085", fontWeight: 600 }}>← Back to homepage</Link></div>
        </div>
      </section>
    </main>
  );
}
