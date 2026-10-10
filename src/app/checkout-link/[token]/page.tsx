import { notFound, redirect } from "next/navigation";
import { createCheckoutSessionFromPaymentLink } from "@/server/modules/payment-links/service";

/**
 * Public payment links are resolved server-side and exchanged for short-lived
 * checkout sessions. No provider call is made from this page.
 */
export default async function PaymentLinkRedirectPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    const session = await createCheckoutSessionFromPaymentLink(token);
    // Only navigate to the path produced by the server's configured APP_URL.
    redirect(new URL(session.checkoutUrl).pathname);
  } catch (error) {
    // Next's redirect throws a framework control-flow exception; rethrow it.
    if (error && typeof error === "object" && "digest" in error) throw error;
    notFound();
  }
}
