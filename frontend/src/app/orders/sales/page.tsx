"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import OrderDateFilter from "@/components/orders/OrderDateFilter";
import { formatCurrency } from "@/lib/format";
import {
  getSalesOrders,
  nextSellerStatuses,
  type OrderResponse,
  type OrderStatus,
  orderStatusLabel,
  orderStatusStyle,
  updateOrderStatus,
} from "@/lib/services/orders-http";

function SalesContent() {
  const [orders, setOrders] = useState<OrderResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const hasDateFilter = Boolean(from || to);

  useEffect(() => {
    let active = true;
    setError(null);
    (async () => {
      try {
        const data = await getSalesOrders({
          from: from || undefined,
          to: to || undefined,
        });
        if (active) setOrders(data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las ventas",
          );
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [from, to]);

  const advance = async (orderId: string, status: OrderStatus) => {
    setBusyId(orderId);
    setError(null);
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        (prev ?? []).map((o) => (o.id === orderId ? updated : o)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold text-gray-900">
        Pedidos recibidos
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Gestiona el estado de los pedidos que incluyen tus productos.
      </p>

      <OrderDateFilter
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
      />

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {orders === null && !error ? (
        <p className="mt-8 text-sm text-gray-500">Cargando…</p>
      ) : null}

      {orders && orders.length === 0 ? (
        <p className="mt-8 text-gray-600">
          {hasDateFilter
            ? "No hay ventas en el rango de fechas seleccionado."
            : "Aún no has recibido pedidos."}
        </p>
      ) : null}

      <ul className="mt-6 space-y-4">
        {orders?.map((order) => {
          const actions = nextSellerStatuses(order.status);
          return (
            <li
              key={order.id}
              className="rounded-lg border border-gray-200 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900">
                    Pedido {order.orderNumber}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {order.createDateTime
                      ? new Date(order.createDateTime).toLocaleString()
                      : null}{" "}
                    · {order.user?.name ?? order.user?.email ?? "Cliente"}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${orderStatusStyle(
                    order.status,
                  )}`}
                >
                  {orderStatusLabel(order.status)}
                </span>
              </div>

              <ul className="mt-3 space-y-1 text-sm text-gray-600">
                {order.items?.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.quantity} × {item.productName}
                    </span>
                    <span>
                      {formatCurrency(item.totalPrice, order.currency)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                <span className="text-sm font-medium text-gray-900">
                  Total: {formatCurrency(order.total, order.currency)}
                </span>
                <div className="flex flex-wrap gap-2">
                  {actions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() => advance(order.id, status)}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
                        status === "CANCELED"
                          ? "border border-red-300 text-red-700 hover:bg-red-50"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {status === "CANCELED"
                        ? "Cancelar"
                        : `Marcar ${orderStatusLabel(status)}`}
                    </button>
                  ))}
                  {actions.length === 0 ? (
                    <span className="text-sm text-gray-400">Sin acciones</span>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function SalesOrdersPage() {
  return (
    <RequireAuth roles={["seller", "admin"]}>
      <SalesContent />
    </RequireAuth>
  );
}
