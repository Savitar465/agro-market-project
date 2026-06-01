"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { forwardRef, useEffect, useState } from "react";
import type React from "react";
import { useForm } from "react-hook-form";
import { formatCurrency } from "@/lib/format";
import QrCode from "@/components/payments/QrCode";
import {
  type CheckoutSessionResult,
  type PaymentMethod,
  confirmMockPayment,
  createCheckoutSession,
  getPaymentStatus,
} from "@/lib/services/payments-http";

type ShippingForm = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
};

const inputClass =
  "block w-full rounded-md border border-gray-300 px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 sm:text-sm";

/** Persists shipping details so the confirmation page can show them on the receipt. */
function storeShipping(paymentId: string, shipping: ShippingForm) {
  try {
    sessionStorage.setItem(`shipping_${paymentId}`, JSON.stringify(shipping));
  } catch {
    // sessionStorage may be unavailable (private mode); receipt simply omits it.
  }
}

export default function Page() {
  const router = useRouter();
  const { cart, cartTotal } = useStore();
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [session, setSession] = useState<CheckoutSessionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingForm>();

  // While a QR payment is pending, poll until the backend marks it PAID
  // (the buyer pays on another device), then move to the confirmation page.
  useEffect(() => {
    if (!session || session.method !== "qr") {
      return;
    }

    let active = true;
    const timer = setInterval(async () => {
      try {
        const status = await getPaymentStatus(session.paymentId);
        if (!active) return;
        if (status.status === "PAID") {
          clearInterval(timer);
          router.push(`/checkout/success?payment=${session.paymentId}`);
        } else if (status.status === "FAILED" || status.status === "CANCELED") {
          clearInterval(timer);
          setError("Payment was not completed. Please try again.");
          setSession(null);
        }
      } catch {
        // Transient errors are ignored; the next tick retries.
      }
    }, 2500);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [session, router]);

  if (cart.length === 0 && !session) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mb-4">
          Checkout
        </h1>
        <p className="text-gray-600 mb-6">Your cart is empty.</p>
        <Link
          href="/store"
          className="inline-block rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const onSubmit = handleSubmit(async (shipping) => {
    setError(null);
    try {
      const result = await createCheckoutSession(method);
      storeShipping(result.paymentId, shipping);

      if (method === "qr") {
        // Stay here and render the QR; the polling effect handles completion.
        setSession(result);
        return;
      }

      // Card: hand off to the hosted payment page (Stripe) or, in mock mode,
      // the local simulated-payment screen.
      if (result.mock) {
        router.push(`/checkout/pay?payment=${result.paymentId}`);
      } else {
        window.location.href = result.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment");
    }
  });

  const handleMockPay = async () => {
    if (!session) return;
    try {
      await confirmMockPayment(session.paymentId);
      router.push(`/checkout/success?payment=${session.paymentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm payment");
    }
  };

  if (session && session.method === "qr") {
    return (
      <QrPaymentPanel
        session={session}
        onCancel={() => setSession(null)}
        onMockPay={handleMockPay}
      />
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16"
    >
      <div>
        <h2 className="text-lg font-medium text-gray-900">Contact information</h2>
        <div className="mt-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
            })}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <h2 className="mt-8 text-lg font-medium text-gray-900">
          Shipping information
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          <Field
            label="First name"
            id="firstName"
            error={errors.firstName?.message}
            {...register("firstName", { required: "Required" })}
          />
          <Field
            label="Last name"
            id="lastName"
            error={errors.lastName?.message}
            {...register("lastName", { required: "Required" })}
          />
          <div className="sm:col-span-2">
            <Field
              label="Address"
              id="address"
              error={errors.address?.message}
              {...register("address", { required: "Required" })}
            />
          </div>
          <Field
            label="City"
            id="city"
            error={errors.city?.message}
            {...register("city", { required: "Required" })}
          />
          <Field
            label="Postal code"
            id="postalCode"
            error={errors.postalCode?.message}
            {...register("postalCode", { required: "Required" })}
          />
        </div>

        <h2 className="mt-8 text-lg font-medium text-gray-900">Payment method</h2>
        <div className="mt-4 space-y-3">
          <MethodOption
            value="card"
            checked={method === "card"}
            onChange={() => setMethod("card")}
            title="Credit / debit card"
            description="Secure card payment via Stripe."
          />
          <MethodOption
            value="qr"
            checked={method === "qr"}
            onChange={() => setMethod("qr")}
            title="Pay with QR"
            description="Scan a QR code to pay from your phone."
          />
        </div>
      </div>

      <div className="mt-10 lg:mt-0">
        <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
          <ul role="list" className="divide-y divide-gray-200">
            {cart.map((item) => {
              const unitPrice = Number(item.product?.price ?? 0);
              return (
                <li key={item.itemId} className="flex px-4 py-6 sm:px-6">
                  <div className="flex-shrink-0">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name ?? "Product"}
                      className="w-20 rounded-md"
                    />
                  </div>
                  <div className="ml-6 flex flex-1 flex-col">
                    <div className="flex">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-gray-700">
                          {item.product?.name}
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="ml-4 text-sm font-medium text-gray-900">
                        {formatCurrency(unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <dl className="space-y-6 border-t border-gray-200 px-4 py-6 sm:px-6">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-900">Subtotal</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatCurrency(cartTotal)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-900">Shipping</dt>
              <dd className="text-sm font-medium text-gray-900">Free</dd>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <dt className="text-base font-medium text-gray-900">Total</dt>
              <dd className="text-base font-medium text-gray-900">
                {formatCurrency(cartTotal)}
              </dd>
            </div>
          </dl>

          {error && (
            <p className="px-4 pb-2 text-sm text-red-600 sm:px-6">{error}</p>
          )}

          <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Processing..."
                : method === "qr"
                  ? "Generate payment QR"
                  : "Pay now"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function QrPaymentPanel({
  session,
  onCancel,
  onMockPay,
}: {
  session: CheckoutSessionResult;
  onCancel: () => void;
  onMockPay: () => void;
}) {
  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        Scan to pay
      </h1>
      <p className="mt-2 text-gray-600">
        Scan this QR code with your phone to pay{" "}
        <span className="font-medium text-gray-900">
          {formatCurrency(session.amount, session.currency)}
        </span>
        . This page updates automatically once the payment is confirmed.
      </p>
      <div className="mt-6 flex justify-center">
        <QrCode value={session.url} />
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-indigo-600" />
        Waiting for payment…
      </div>

      {session.mock && (
        <button
          type="button"
          onClick={onMockPay}
          className="mt-6 w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Simulate payment (dev / mock mode)
        </button>
      )}

      <button
        type="button"
        onClick={onCancel}
        className="mt-3 w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
    </div>
  );
}

function MethodOption({
  value,
  checked,
  onChange,
  title,
  description,
}: {
  value: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 ${
        checked ? "border-indigo-600 ring-1 ring-indigo-600" : "border-gray-300"
      }`}
    >
      <input
        type="radio"
        name="payment-method"
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-1"
      />
      <span>
        <span className="block text-sm font-medium text-gray-900">{title}</span>
        <span className="block text-sm text-gray-500">{description}</span>
      </span>
    </label>
  );
}

type FieldProps = {
  label: string;
  id: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

// forwardRef so react-hook-form's `register` ref attaches to the input.
const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, id, error, ...rest },
  ref,
) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input id={id} ref={ref} className={inputClass} {...rest} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});
