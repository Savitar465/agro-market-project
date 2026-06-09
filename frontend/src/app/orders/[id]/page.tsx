"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import {
  getOrder,
  type OrderResponse,
  type OrderStatus,
  orderStatusLabel,
  orderStatusStyle,
} from "@/lib/services/orders-http";

// Visual progress for the fulfillment lifecycle (canceled orders skip this).
const TIMELINE: OrderStatus[] = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

function StatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELED" || status === "PENDING_PAYMENT") {
    return null;
  }
  const currentIndex = TIMELINE.indexOf(status);

  return (
    <ol className="mt-6 flex items-center">
      {TIMELINE.map((step, index) => {
        const reached = index <= currentIndex;
        return (
          <li key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  reached
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {index + 1}
              </span>
              <span className="mt-1 w-20 text-center text-xs text-gray-500">
                {orderStatusLabel(step)}
              </span>
            </div>
            {index < TIMELINE.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 ${
                  index < currentIndex ? "bg-indigo-600" : "bg-gray-200"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getOrder(id);
        if (active) setOrder(data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "No se pudo cargar el pedido",
          );
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-red-600">{error}</p>
        <Link href="/orders" className="mt-4 inline-block text-indigo-600">
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  if (!order) {
    return <p className="text-center text-gray-500">Cargando…</p>;
  }

  const shipping = order.shipping;
  const hasShipping =
    shipping && (shipping.address || shipping.firstName || shipping.email);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/orders"
        className="text-sm text-indigo-600 hover:text-indigo-500"
      >
        ← Mis pedidos
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">
          Pedido {order.orderNumber}
        </h1>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${orderStatusStyle(
            order.status,
          )}`}
        >
          {orderStatusLabel(order.status)}
        </span>
      </div>

      <p className="mt-1 text-sm text-gray-500">
        Realizado el{" "}
        {order.createDateTime
          ? new Date(order.createDateTime).toLocaleString()
          : "—"}
        {order.paidAt
          ? ` · Pagado el ${new Date(order.paidAt).toLocaleString()}`
          : null}
      </p>

      <StatusTimeline status={order.status} />

      <h2 className="mt-8 text-lg font-medium text-gray-900">Artículos</h2>
      <ul className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200">
        {order.items?.map((item) => (
          <li key={item.id} className="flex items-center gap-4 px-4 py-4">
            {item.image ? (
              <img
                src={item.image}
                alt={item.productName}
                className="h-16 w-16 rounded-md object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-md bg-gray-100" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {item.productName}
              </p>
              <p className="mt-0.5 text-sm text-gray-500">
                {item.quantity} ×{" "}
                {formatCurrency(item.unitPrice, order.currency)}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {formatCurrency(item.totalPrice, order.currency)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-6 space-y-2 rounded-lg border border-gray-200 p-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Subtotal</dt>
          <dd className="text-gray-900">
            {formatCurrency(order.subtotal, order.currency)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Envío</dt>
          <dd className="text-gray-900">Gratis</dd>
        </div>
        <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-medium">
          <dt className="text-gray-900">Total</dt>
          <dd className="text-gray-900">
            {formatCurrency(order.total, order.currency)}
          </dd>
        </div>
      </dl>

      {hasShipping ? (
        <div className="mt-6 rounded-lg border border-gray-200 p-5 text-sm">
          <h3 className="font-medium text-gray-900">Envío</h3>
          <p className="mt-2 text-gray-600">
            {[shipping?.firstName, shipping?.lastName]
              .filter(Boolean)
              .join(" ")}
            {shipping?.address ? `, ${shipping.address}` : ""}
            {shipping?.city ? `, ${shipping.city}` : ""}
            {shipping?.postalCode ? ` ${shipping.postalCode}` : ""}
          </p>
          {shipping?.email ? (
            <p className="mt-1 text-gray-500">{shipping.email}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
