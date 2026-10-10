import Link from "next/link";

/**
 * Provider return URLs are navigation only. The browser returning here is not
 * evidence that a payment succeeded; the server must rely on verified provider
 * events or a provider-side status lookup before changing payment state.
 */
export default function CheckoutReturnPage() {
  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <Link className="brand-lockup" href="/" aria-label="DonexisPay home">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span>donexis<span className="brand-accent">pay</span></span>
        </Link>
        <span className="checkout-security"><span aria-hidden="true">⌑</span> Checkout update</span>
      </header>

      <section className="checkout-return-card">
        <span className="checkout-return-icon" aria-hidden="true">↗</span>
        <p className="section-kicker">Provider redirect</p>
        <h1>Check your payment confirmation</h1>
        <p>
          You have returned from the payment provider. This redirect alone does not confirm
          whether a payment succeeded or failed. Wait for the business to confirm your payment
          using its verified payment status.
        </p>
        <div className="checkout-notice">
          <span aria-hidden="true">i</span>
          <p><strong>Do not submit the same payment again just because this page appeared.</strong><br />
          If you are unsure, contact the business that requested the payment and share only the order reference they provided.</p>
        </div>
        <Link className="button button-primary" href="/">Return to DonexisPay <span aria-hidden="true">→</span></Link>
      </section>
      <footer className="checkout-page-footer">
        <span>Never share your password or one-time verification codes.</span>
        <span>DonexisPay is not a bank or card network.</span>
      </footer>
    </main>
  );
}
