import "server-only";
import type { Order } from "@prisma/client";

/**
 * Payment abstraction.
 *
 * Online payment (Stripe) is a later increment. The checkout flow talks to this
 * interface only, so a real provider can be slotted in without touching
 * `createOrder`. For now the single implementation simply marks the order
 * pending — no charge, no redirect.
 */

export type PaymentStatus = "pending" | "paid";

export interface PaymentResult {
  /** Identifier persisted on the order (`paymentProvider`). */
  provider: string | null;
  status: PaymentStatus;
  /** Where to send the customer next (e.g. a Stripe Checkout URL). */
  redirectUrl?: string;
  /** Provider-side reference, if any (`paymentRef`). */
  reference?: string;
}

export interface PaymentProvider {
  readonly name: string;
  createCheckout(order: Order): Promise<PaymentResult>;
}

/**
 * No-op provider used until Stripe is wired. Leaves the order in its pending
 * (`EN_ATTENTE`) state with no payment provider attached.
 */
export const pendingProvider: PaymentProvider = {
  name: "pending",
  async createCheckout(_order: Order): Promise<PaymentResult> {
    void _order;
    return { provider: null, status: "pending" };
  },
};

/** The active provider. Swap to a Stripe impl here when payment goes live. */
export function getPaymentProvider(): PaymentProvider {
  return pendingProvider;
}
