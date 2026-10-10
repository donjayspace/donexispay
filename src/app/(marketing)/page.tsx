export default function HomePage() {
  return (
    <main className="container">
      <header className="topbar">
        <div className="brand">DonexisPay</div>
        <span className="badge">Development scaffold · Live payments disabled</span>
      </header>

      <section className="hero">
        <p className="eyebrow">Payment orchestration</p>
        <h1>One clear layer for checkout and payment operations.</h1>
        <p className="lead">
          DonexisPay is being built to help businesses create checkout sessions,
          coordinate approved payment providers, and track payment outcomes through
          a consistent, auditable platform.
        </p>

        <div className="panel">
          <strong>Current environment: development foundation</strong>
          <p className="muted">
            Live transactions are disabled until a payment provider is selected,
            credentials are configured, and required security, legal, and operational
            reviews are complete.
          </p>
        </div>
      </section>

      <section aria-label="Platform foundations" className="grid">
        <article className="card">
          <h2>Provider-independent design</h2>
          <p className="muted">A dedicated adapter boundary keeps provider-specific APIs out of core payment workflows.</p>
        </article>
        <article className="card">
          <h2>Auditable payment lifecycle</h2>
          <p className="muted">Explicit statuses, idempotency controls, and traceable operational records are foundational requirements.</p>
        </article>
        <article className="card">
          <h2>Security by design</h2>
          <p className="muted">Server-side authorization, verified provider events, and careful secret handling are required before launch.</p>
        </article>
      </section>

      <footer>
        DonexisPay is not a bank or payment network. Supported services depend on approved providers and applicable legal requirements.
      </footer>
    </main>
  );
}
