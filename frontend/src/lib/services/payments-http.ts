import { apiRequest } from "@/lib/services/http-client";

const PAYMENTS_PATH = "/payments";

export type PaymentMethod = "card" | "qr";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELED";

export type ShippingDetails = {
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
};

export type CheckoutSessionResult = {
  paymentId: string;
  orderId: string;
  sessionId: string | null;
  url: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  // True when the backend has no Stripe credentials (simulated payment).
  mock: boolean;
};

export type PaymentStatusResult = {
  paymentId: string;
  orderId: string | null;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
  currency: string;
  paidAt?: string | null;
};

export async function createCheckoutSession(
  method: PaymentMethod,
  shipping?: ShippingDetails,
): Promise<CheckoutSessionResult> {
  return apiRequest<CheckoutSessionResult>(
    `${PAYMENTS_PATH}/checkout-session`,
    {
      method: "POST",
      body: JSON.stringify({ method, shipping }),
    },
  );
}

export async function getPaymentStatus(
  paymentId: string,
): Promise<PaymentStatusResult> {
  return apiRequest<PaymentStatusResult>(`${PAYMENTS_PATH}/${paymentId}`, {
    method: "GET",
  });
}

/** Simulates a successful payment. Only works while the backend is in mock mode. */
export async function confirmMockPayment(
  paymentId: string,
): Promise<PaymentStatusResult> {
  return apiRequest<PaymentStatusResult>(
    `${PAYMENTS_PATH}/${paymentId}/confirm-mock`,
    { method: "POST" },
  );
}
