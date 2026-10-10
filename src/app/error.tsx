"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep the UI resilient without exposing internal exception details to visitors.
    console.error("Application rendering error", { digest: error.digest });
  }, [error]);

  return (
    <main className="system-page">
      <Link className="brand-lockup" href="/"><span className="brand-mark" aria-hidden="true">D</span><span>donexis<span className="brand-accent">pay</span></span></Link>
      <section className="system-card">
        <span className="system-code">Oops</span>
        <h1>Something didn&apos;t load as expected.</h1>
        <p>Your request could not be completed. Try again, or return to a safe page. Sensitive error details are not shown here.</p>
        <div className="system-actions"><button className="button button-primary" onClick={reset} type="button">Try again</button><Link className="button button-secondary" href="/">Back to homepage</Link></div>
      </section>
    </main>
  );
}
