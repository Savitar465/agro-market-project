import { apiRequest } from "@/lib/services/http-client";
import type { ShippingDetails } from "@/lib/services/payments-http";

const ORDERS_PATH = "/orders";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED";

export type OrderItemResponse = {
  id: string;
  productId: string | null;
  sellerId: string | null;
  productName: string;
  unit?: string | null;
  image?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
};

export type OrderResponse = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  total: number;
  currency: string;
  itemCount: number;
  shipping?: ShippingDetails | null;
  paidAt?: string | null;
  createDateTime?: string;
  items?: OrderItemResponse[];
  user?: { id: string; name?: string; email?: string };
};

export type OrderDateFilter = {
  /** YYYY-MM-DD; only orders created on or after this local date. */
  from?: string;
  /** YYYY-MM-DD; only orders created on or before this local date. */
  to?: string;
};

// The backend filters on exact timestamps, so the selected local days are
// converted to ISO instants covering the full day in the user's timezone.
function dateFilterQuery(filter?: OrderDateFilter) {
  return {
    from: filter?.from
      ? new Date(`${filter.from}T00:00:00`).toISOString()
      : undefined,
    to: filter?.to
      ? new Date(`${filter.to}T23:59:59.999`).toISOString()
      : undefined,
  };
}

/** Buyer order history, newest first. */
export async function getMyOrders(
  filter?: OrderDateFilter,
): Promise<OrderResponse[]> {
  return apiRequest<OrderResponse[]>(ORDERS_PATH, {
    method: "GET",
    query: dateFilterQuery(filter),
  });
}

/** A single order (status + confirmation details). */
export async function getOrder(orderId: string): Promise<OrderResponse> {
  return apiRequest<OrderResponse>(`${ORDERS_PATH}/${orderId}`, {
    method: "GET",
  });
}

/** Incoming orders for the authenticated seller (admin: all orders). */
export async function getSalesOrders(
  filter?: OrderDateFilter,
): Promise<OrderResponse[]> {
  return apiRequest<OrderResponse[]>(`${ORDERS_PATH}/sales`, {
    method: "GET",
    query: dateFilterQuery(filter),
  });
}

/** Advances an order's fulfillment status (seller/admin). */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<OrderResponse> {
  return apiRequest<OrderResponse>(`${ORDERS_PATH}/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pago pendiente",
  PAID: "Pagado",
  PROCESSING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELED: "Cancelado",
};

export function orderStatusLabel(status: OrderStatus): string {
  return STATUS_LABELS[status] ?? status;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
};

export function orderStatusStyle(status: OrderStatus): string {
  return STATUS_STYLES[status] ?? "bg-gray-100 text-gray-800";
}

/** The status a seller/admin may advance to next (UI affordance). */
export function nextSellerStatuses(status: OrderStatus): OrderStatus[] {
  switch (status) {
    case "PAID":
      return ["PROCESSING", "CANCELED"];
    case "PROCESSING":
      return ["SHIPPED", "CANCELED"];
    case "SHIPPED":
      return ["DELIVERED"];
    default:
      return [];
  }
}
