"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import {
  type PaymentStatusResult,
  confirmMockPayment,
  getPaymentStatus,
} from "@/lib/services/payments-http";

/**
 * Simulated hosted-checkout page used when the backend runs without Stripe
 * credentials (mock mode). It stands in for Stripe's hosted payment page so the
 * full pay -> confirm -> receipt flow works end to end in development.
 */
function MockPay() {
  const router = useRouter();
  const params = useSearchParams();
  const paymentId = params.get("payment");
  const [payment, setPayment] = useState<PaymentStatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!paymentId) {
      setError("Missing payment reference.");
      return;
    }
    getPaymentStatus(paymentId)
      .then((status) => {
        if (status.status === "PAID") {
          router.replace(`/checkout/success?payment=${paymentId}`);
        } else {
          setPayment(status);
        }
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Payment not found"),
      );
  }, [paymentId, router]);

  const handlePay = async () => {
    if (!paymentId) return;
    setPaying(true);
    setError(null);
    try {
      await confirmMockPayment(paymentId);
      router.push(`/checkout/success?payment=${paymentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setPaying(false);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-red-600">{error}</p>
        <Link href="/cart" className="mt-4 inline-block text-indigo-600">
          Back to cart
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 p-8 text-center shadow-sm">
      <div className="mb-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
        Simulated payment (mock mode)
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        Confirm your payment
      </h1>
      <p className="mt-2 text-gray-600">
        Amount due:{" "}
        <span className="font-medium text-gray-900">
          {payment ? formatCurrency(payment.amount, payment.currency) : "…"}
        </span>
      </p>
      <button
        type="button"
        onClick={handlePay}
        disabled={paying || !payment}
        className="mt-6 w-full rounded-md bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {paying ? "Processing…" : "Pay now"}
      </button>
      <Link
        href="/cart"
        className="mt-3 inline-block w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </Link>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center text-gray-500">Loading…</div>}>
      <MockPay />
    </Suspense>
  );
}
