export enum OrderStatus {
  // The order has been placed but the payment has not been captured yet.
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  // Payment captured; stock has been discounted and the order is confirmed.
  PAID = 'PAID',
  // The seller is preparing the order.
  PROCESSING = 'PROCESSING',
  // The order has been handed to delivery.
  SHIPPED = 'SHIPPED',
  // The buyer received the order.
  DELIVERED = 'DELIVERED',
  // The order was canceled (payment failed/expired or canceled by seller/admin).
  CANCELED = 'CANCELED',
}

/**
 * Allowed forward transitions a seller/admin can apply once an order is paid.
 * PENDING_PAYMENT -> PAID/CANCELED is driven by the payment flow, not by hand.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING_PAYMENT]: [OrderStatus.CANCELED],
  [OrderStatus.PAID]: [OrderStatus.PROCESSING, OrderStatus.CANCELED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELED]: [],
};
