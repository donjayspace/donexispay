import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="system-page">
      <Link className="brand-lockup" href="/"><span className="brand-mark" aria-hidden="true">D</span><span>donexis<span className="brand-accent">pay</span></span></Link>
      <section className="system-card">
        <span className="system-code">404</span>
        <h1>We couldn&apos;t find that page.</h1>
        <p>The link may be incorrect, expired, or no longer available. Check the address or return to the DonexisPay homepage.</p>
        <div className="system-actions"><Link className="button button-primary" href="/">Back to homepage</Link><Link className="button button-secondary" href="/dashboard">Dashboard preview</Link></div>
      </section>
    </main>
  );
}
