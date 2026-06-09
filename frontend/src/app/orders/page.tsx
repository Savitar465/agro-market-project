"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import {
  getMyOrders,
  type OrderResponse,
  orderStatusLabel,
  orderStatusStyle,
} from "@/lib/services/orders-http";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getMyOrders();
        if (active) setOrders(data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los pedidos",
          );
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900">Mis pedidos</h1>
      <p className="mt-1 text-sm text-gray-600">
        Historial de tus compras y el estado de cada pedido.
      </p>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {orders === null && !error ? (
        <p className="mt-8 text-sm text-gray-500">Cargando…</p>
      ) : null}

      {orders && orders.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600">Todavía no tienes pedidos.</p>
          <Link
            href="/store"
            className="mt-4 inline-block rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Explorar la tienda
          </Link>
        </div>
      ) : null}

      <ul className="mt-6 space-y-4">
        {orders?.map((order) => (
          <li key={order.id}>
            <Link
              href={`/orders/${order.id}`}
              className="block rounded-lg border border-gray-200 p-5 transition hover:border-indigo-400 hover:shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900">
                    Pedido {order.orderNumber}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {order.createDateTime
                      ? new Date(order.createDateTime).toLocaleDateString()
                      : null}{" "}
                    · {order.itemCount}{" "}
                    {order.itemCount === 1 ? "artículo" : "artículos"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${orderStatusStyle(
                      order.status,
                    )}`}
                  >
                    {orderStatusLabel(order.status)}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(order.total, order.currency)}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
