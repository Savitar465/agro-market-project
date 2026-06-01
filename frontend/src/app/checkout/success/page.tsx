"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import {
  type PaymentStatusResult,
  getPaymentStatus,
} from "@/lib/services/payments-http";

type Shipping = {
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
};

function readShipping(paymentId: string): Shipping | null {
  try {
    const raw = sessionStorage.getItem(`shipping_${paymentId}`);
    return raw ? (JSON.parse(raw) as Shipping) : null;
  } catch {
    return null;
  }
}

function Confirmation() {
  const params = useSearchParams();
  const paymentId = params.get("payment");
  const { refreshCart, refreshProducts } = useStore();
  const [payment, setPayment] = useState<PaymentStatusResult | null>(null);
  const [shipping, setShipping] = useState<Shipping | null>(null);
  const [error, setError] = useState<string | null>(null);
  const finalizedRef = useRef(false);

  useEffect(() => {
    if (!paymentId) {
      setError("Missing payment reference.");
      return;
    }

    setShipping(readShipping(paymentId));

    let active = true;
    const check = async () => {
      try {
        const status = await getPaymentStatus(paymentId);
        if (!active) return;
        setPayment(status);
        if (status.status === "PAID" && !finalizedRef.current) {
          finalizedRef.current = true;
          // The purchased cart is closed server-side; sync local state.
          await refreshCart();
          await refreshProducts();
          clearInterval(timer);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Payment not found");
          clearInterval(timer);
        }
      }
    };

    const timer = setInterval(check, 2500);
    void check();

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [paymentId, refreshCart, refreshProducts]);

  if (error) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900">Order</h1>
        <p className="mt-2 text-red-600">{error}</p>
        <Link href="/store" className="mt-4 inline-block text-indigo-600">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (!payment || payment.status !== "PAID") {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-600" />
        <p className="text-gray-600">Confirming your payment…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg text-center">
      <svg
        className="mx-auto h-16 w-16 text-emerald-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
        Order confirmed!
      </h1>
      <p className="mt-2 text-gray-600">
        Thank you for your purchase. A confirmation has been recorded.
      </p>

      <dl className="mt-8 space-y-3 rounded-lg border border-gray-200 p-6 text-left text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Order reference</dt>
          <dd className="font-medium text-gray-900">{payment.paymentId}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Amount paid</dt>
          <dd className="font-medium text-gray-900">
            {formatCurrency(payment.amount, payment.currency)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Payment method</dt>
          <dd className="font-medium text-gray-900">
            {payment.method === "qr" ? "QR" : "Card"}
          </dd>
        </div>
        {payment.paidAt && (
          <div className="flex justify-between">
            <dt className="text-gray-500">Paid at</dt>
            <dd className="font-medium text-gray-900">
              {new Date(payment.paidAt).toLocaleString()}
            </dd>
          </div>
        )}
        {shipping && (shipping.address || shipping.firstName) && (
          <div className="border-t border-gray-100 pt-3">
            <dt className="text-gray-500">Shipping to</dt>
            <dd className="mt-1 font-medium text-gray-900">
              {[shipping.firstName, shipping.lastName].filter(Boolean).join(" ")}
              {shipping.address ? `, ${shipping.address}` : ""}
              {shipping.city ? `, ${shipping.city}` : ""}
              {shipping.postalCode ? ` ${shipping.postalCode}` : ""}
            </dd>
          </div>
        )}
      </dl>

      <Link
        href="/store"
        className="mt-8 inline-block rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700"
      >
        Continue shopping
      </Link>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center text-gray-500">Loading…</div>}>
      <Confirmation />
    </Suspense>
  );
}
