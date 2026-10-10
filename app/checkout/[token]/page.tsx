import { notFound } from "next/navigation";
import { getCheckoutSessionByToken } from "@/server/modules/checkout/services/create-checkout-session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatMinorAmount(amountMinor: bigint, currency: string): string {
  // Intl supplies the currency's fraction-digit metadata; BigInt arithmetic preserves precision.
  let fractionDigits = 2;
  try {
    fractionDigits = new Intl.NumberFormat("en", {
      style: "currency",
      currency,
    }).resolvedOptions().maximumFractionDigits;
  } catch {
    return `${currency} ${amountMinor.toString()} minor units`;
  }

  const divisor = 10n ** BigInt(fractionDigits);
  const whole = amountMinor / divisor;
  const fraction = (amountMinor % divisor).toString().padStart(fractionDigits, "0");
  const groupedWhole = new Intl.NumberFormat("en").format(whole);

  if (fractionDigits === 0) return `${currency} ${groupedWhole}`;
  return `${currency} ${groupedWhole}.${fraction}`;
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let session;

  try {
    session = await getCheckoutSessionByToken(token);
  } catch {
    notFound();
  }

  const expired = session.status === "EXPIRED";

  return (
    <main className="container" style={{ maxWidth: 720 }}>
      <header className="topbar">
        <div className="brand">DonexisPay</div>
        <span className="badge">Secure checkout session</span>
      </header>

      <section className="panel" aria-labelledby="checkout-title">
        <p className="eyebrow">Payment request</p>
        <h1 id="checkout-title" style={{ fontSize: "clamp(2rem, 6vw, 3rem)" }}>
          {expired ? "This checkout has expired" : "Review your checkout"}
        </h1>

        {expired ? (
          <p className="muted">Ask the merchant to create a new checkout session.</p>
        ) : (
          <>
            <p className="muted">Payment requested by</p>
            <h2>{session.merchant.name}</h2>
            <p style={{ fontSize: "1.8rem", fontWeight: 800 }}>
              {formatMinorAmount(session.amountMinor, session.currency)}
            </p>
            {session.description ? <p className="muted">{session.description}</p> : null}
            <p className="muted">
              This session is awaiting payment integration. No payment has been taken on this page.
            </p>
            <p className="muted">Session status: {session.status}</p>
          </>
        )}
      </section>

      <footer>
        DonexisPay will never ask you to share a password or one-time security code in this page.
      </footer>
    </main>
  );
}
