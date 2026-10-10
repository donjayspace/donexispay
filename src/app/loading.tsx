export default function LoadingPage() {
  return (
    <main className="system-page" aria-busy="true" aria-live="polite">
      <div className="loading-brand"><span className="brand-mark" aria-hidden="true">D</span><span>donexis<span className="brand-accent">pay</span></span></div>
      <section className="loading-card"><span className="loading-spinner" aria-hidden="true"></span><strong>Loading your workspace</strong><p>Please wait while the page is prepared.</p></section>
    </main>
  );
}
