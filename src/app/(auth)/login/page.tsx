import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-story">
        <Link className="brand-lockup" href="/"><span className="brand-mark" aria-hidden="true">D</span><span>donexis<span className="brand-accent">pay</span></span></Link>
        <div><p className="section-kicker">Your payment workspace</p><h1>More clarity behind every transaction.</h1><p>Manage checkout, review payment activity, and prepare your integrations from one considered workspace.</p></div>
        <p className="auth-note">Secure-by-design architecture. Live payment processing is not enabled in this preview.</p>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form">
          <p className="section-kicker">Welcome back</p><h2>Sign in to DonexisPay</h2><p>Enter your work email to continue to your workspace.</p>
          <form action="/dashboard" method="get">
            <label className="form-label" htmlFor="email">Work email</label><input className="form-field" id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
            <label className="form-label" htmlFor="password">Password</label><input className="form-field" id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
            <button className="button button-primary form-submit" type="button" aria-describedby="auth-notice">Continue securely <span aria-hidden="true">→</span></button>
          </form>
          <div className="notice" id="auth-notice"><strong>Authentication UI preview.</strong> Sign-in is not connected yet, and this form does not authenticate or submit credentials. Do not enter a real password.</div>
          <div className="form-foot">Need to explore first? <Link href="/dashboard" style={{ color: "#405ce5", fontWeight: 700 }}>Open the dashboard preview</Link></div>
        </div>
      </section>
    </main>
  );
}
