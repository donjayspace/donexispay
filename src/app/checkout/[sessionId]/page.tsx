import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutStatus } from "@prisma/client";
import { getCheckoutSessionByToken } from "@/server/modules/checkout/services/create-checkout-session";

type CheckoutPageProps = {
  params: Promise<{ sessionId: string }>;
};

const zeroDecimalCurrencies = new Set(["BIF", "CLP", "DJF", "GNF", "ISK", "JPY", "KMF", "KRW", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"]);
const threeDecimalCurrencies = new Set(["BHD", "IQD", "JOD", "KWD", "LYD", "OMR", "TND"]);

function formatMinorAmount(amountMinor: bigint, currency: string): string {
  const exponent = zeroDecimalCurrencies.has(currency) ? 0 : threeDecimalCurrencies.has(currency) ? 3 : 2;
  const divisor = 10n ** BigInt(exponent);
  const whole = amountMinor / divisor;
  const fraction = (amountMinor % divisor).toString().padStart(exponent, "0");
  const groupedWhole = new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(whole);
  return exponent ? `${currency} ${groupedWhole}.${fraction}` : `${currency} ${groupedWhole}`;
}

function statusCopy(status: CheckoutStatus, expired: boolean) {
  if (expired || status === CheckoutStatus.EXPIRED) return { title: "This checkout has expired", message: "Please return to the business that sent you this link and request a new checkout session." };
  if (status === CheckoutStatus.COMPLETED) return { title: "Checkout completed", message: "This session is marked as completed. Refer to the merchant's confirmation for the final payment details." };
  if (status === CheckoutStatus.CANCELED) return { title: "Checkout canceled", message: "This checkout session has been canceled. Contact the business if you still need to make this payment." };
  if (status === CheckoutStatus.PROCESSING) return { title: "Payment status is being confirmed", message: "Please wait for confirmation from the payment provider. Avoid creating another payment while the status is being checked." };
  return { title: "Secure checkout", message: "Review the payment details below. Payment options will appear when an approved payment provider is configured." };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { sessionId } = await params;
  let session;

  try {
    session = await getCheckoutSessionByToken(sessionId);
  } catch {
    notFound();
  }

  const expired = session.status === CheckoutStatus.OPEN && session.expiresAt <= new Date();
  const copy = statusCopy(session.status, expired);

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <Link className="brand-lockup" href="/" aria-label="DonexisPay home"><span className="brand-mark" aria-hidden="true">D</span><span>donexis<span className="brand-accent">pay</span></span></Link>
        <span className="checkout-security"><span aria-hidden="true">⌑</span> Protected checkout</span>
      </header>
      <div className="checkout-layout">
        <section className="checkout-main">
          <p className="section-kicker">Payment request</p>
          <h1>{copy.title}</h1>
          <p className="checkout-description">{copy.message}</p>
          <div className="checkout-merchant"><span className="checkout-merchant-avatar">{session.merchant.name.slice(0, 1).toUpperCase()}</span><span><small>Paying</small><strong>{session.merchant.name}</strong></span><span className="merchant-verified" title="Merchant name supplied by the checkout record" aria-label="Merchant details loaded">✓</span></div>
          <section className="checkout-amount-card" aria-label="Payment amount">
            <span>Amount due</span>
            <strong>{formatMinorAmount(session.amountMinor, session.currency)}</strong>
            {session.description ? <p>{session.description}</p> : null}
          </section>
          <div className="checkout-status-row"><span className={expired || session.status === CheckoutStatus.EXPIRED || session.status === CheckoutStatus.CANCELED ? "checkout-status checkout-status-muted" : "checkout-status"}><i></i>{expired ? "EXPIRED" : session.status.replaceAll("_", " ")}</span><span>Session expires {session.expiresAt.toLocaleString("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC</span></div>
          <div className="checkout-notice"><span aria-hidden="true">i</span><p><strong>Payment processing is not enabled on this preview.</strong><br />No money will be collected here. Do not send card details or other sensitive payment information to this page.</p></div>
          <Link className="checkout-back-link" href="/">Powered by <strong>DonexisPay</strong></Link>
        </section>
        <aside className="checkout-aside">
          <div className="checkout-aside-icon" aria-hidden="true">⌁</div>
          <h2>Clear, considered checkout.</h2>
          <p>Confirm the business and amount before proceeding. Your payment status should always be confirmed by the payment provider—not just a browser redirect.</p>
          <div className="checkout-assurance"><span aria-hidden="true">✓</span><span><strong>Session-specific</strong><small>This page is tied to a unique checkout token.</small></span></div>
          <div className="checkout-assurance"><span aria-hidden="true">✓</span><span><strong>Provider-confirmed status</strong><small>Real payment options require a configured, approved provider.</small></span></div>
        </aside>
      </div>
      <footer className="checkout-page-footer"><span>Never share your passwords or one-time verification codes.</span><span>DonexisPay is not a bank or card network.</span></footer>
    </main>
  );
}
