import Link from "next/link";

const capabilities = [
  {
    number: "01",
    title: "One integration surface",
    description: "Build against a consistent checkout API while provider-specific behavior stays behind adapter boundaries.",
  },
  {
    number: "02",
    title: "Clear payment visibility",
    description: "Bring checkout sessions, payment statuses, and operational context into one place as integrations come online.",
  },
  {
    number: "03",
    title: "Designed for control",
    description: "Idempotency, auditable actions, and verified provider events are core platform requirements—not afterthoughts.",
  },
];

export default function HomePage() {
  return (
    <main className="marketing-page">
      <header className="marketing-nav page-width">
        <Link className="brand-lockup" href="/" aria-label="DonexisPay home">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span>donexis<span className="brand-accent">pay</span></span>
        </Link>
        <nav className="marketing-nav-links" aria-label="Main navigation">
          <a href="#platform">Platform</a>
          <a href="#security">Security</a>
          <Link href="/login">Sign in</Link>
          <Link className="button button-primary button-small" href="/dashboard">Open dashboard <span aria-hidden="true">↗</span></Link>
        </nav>
        <details className="mobile-nav">
          <summary aria-label="Open navigation"><span></span><span></span><span></span></summary>
          <nav aria-label="Mobile navigation">
            <a href="#platform">Platform</a>
            <a href="#security">Security</a>
            <Link href="/login">Sign in</Link>
            <Link href="/dashboard">Dashboard preview</Link>
          </nav>
        </details>
      </header>

      <section className="hero-section page-width">
        <div className="hero-copy">
          <div className="announcement"><span className="status-dot"></span> Building the next layer of payment operations</div>
          <h1>Payments should feel <span className="text-gradient">simple.</span></h1>
          <p className="hero-description">
            A unified checkout and payment operations platform designed to help businesses connect approved providers and understand every payment journey.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/dashboard">Explore dashboard <span aria-hidden="true">→</span></Link>
            <a className="button button-secondary" href="#platform">Discover the platform</a>
          </div>
          <div className="hero-proof"><span className="proof-check">✓</span> Built around clear states, traceable events, and provider flexibility.</div>
        </div>

        <div className="hero-visual" aria-label="Illustrative payment operations dashboard">
          <div className="visual-glow"></div>
          <div className="preview-window">
            <div className="preview-topbar"><div className="window-dots"><i></i><i></i><i></i></div><span>workspace / overview</span><span className="preview-live"><i></i> Preview</span></div>
            <div className="preview-body">
              <div className="preview-sidebar"><div className="preview-logo">D</div><span className="preview-side-active">▦</span><span>◷</span><span>⇄</span><span>⚙</span></div>
              <div className="preview-main">
                <div className="preview-greeting"><div><small>MONDAY, OCTOBER 12</small><h3>Good morning</h3></div><span className="avatar">DP</span></div>
                <div className="preview-stats">
                  <div><small>Payment volume</small><strong>— — —</strong><em>Connect a provider</em></div>
                  <div><small>Successful payments</small><strong>—</strong><em>Awaiting integration</em></div>
                </div>
                <div className="preview-chart"><div className="chart-title"><strong>Payment activity</strong><span>Last 7 days</span></div><div className="chart-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div>
                <div className="preview-callout"><span className="callout-icon">↗</span><div><strong>Your workspace, at a glance</strong><small>Live metrics appear after payment services are connected.</small></div></div>
              </div>
            </div>
          </div>
          <div className="floating-note"><span className="floating-icon">✓</span><span><strong>Clear payment states</strong><small>Designed for visibility</small></span></div>
        </div>
      </section>

      <section className="trust-strip page-width" id="platform">
        <p>BUILT FOR THE WORK BEHIND EVERY PAYMENT</p>
        <div><span>Checkout</span><b></b><span>Provider orchestration</span><b></b><span>Transactions</span><b></b><span>Reconciliation</span></div>
      </section>

      <section className="capabilities-section page-width">
        <div className="section-heading"><p className="section-kicker">A stronger foundation</p><h2>Everything connected.<br/><span>Nothing hidden.</span></h2><p>Payment infrastructure should be understandable to the people building, operating, and relying on it.</p></div>
        <div className="capability-grid">{capabilities.map((item) => <article className="capability-card" key={item.number}><span className="capability-number">{item.number}</span><h3>{item.title}</h3><p>{item.description}</p><span className="capability-arrow" aria-hidden="true">↗</span></article>)}</div>
      </section>

      <section className="security-band page-width" id="security"><div className="security-symbol" aria-hidden="true">⌁</div><div><p className="section-kicker">Security is a foundation</p><h2>Built with care for every critical detail.</h2><p>Merchant-scoped access, protected secrets, idempotent operations, and verified event processing are part of the platform&apos;s design.</p></div><Link className="button button-secondary" href="/dashboard">View workspace <span aria-hidden="true">→</span></Link></section>

      <footer className="marketing-footer page-width"><Link className="brand-lockup" href="/"><span className="brand-mark" aria-hidden="true">D</span><span>donexis<span className="brand-accent">pay</span></span></Link><p>Payment operations, with clarity.</p><small>DonexisPay is a payment orchestration project, not a bank or card network. Live processing depends on approved providers and applicable legal requirements.</small><span className="footer-copyright">© {new Date().getFullYear()} DonexisPay</span></footer>
    </main>
  );
}
