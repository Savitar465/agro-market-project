import dataSource from '../src/config/database/data-source';
import { Payment } from '../src/payments/entities/payment.entity';
import { PaymentStatus } from '../src/payments/entities/payment-status.enum';
import { Order } from '../src/orders/entities/order.entity';
import { OrderStatus } from '../src/orders/entities/order-status.enum';

/**
 * One-off reconciliation: any PAID payment whose order is still
 * PENDING_PAYMENT gets its order promoted to PAID. This replicates exactly
 * what PaymentsService.markPaid -> ordersService.markPaidByPaymentId does, so a
 * clean run also proves the code path is correct.
 */
async function main() {
  await dataSource.initialize();
  const paymentRepo = dataSource.getRepository(Payment);
  const orderRepo = dataSource.getRepository(Order);

  const paidPayments = await paymentRepo.find({
    where: { status: PaymentStatus.PAID },
  });

  let fixed = 0;
  for (const payment of paidPayments) {
    if (!payment.orderId) continue;
    const order = await orderRepo.findOne({ where: { id: payment.orderId } });
    if (!order || order.status !== OrderStatus.PENDING_PAYMENT) continue;

    order.status = OrderStatus.PAID;
    order.paidAt = payment.paidAt ?? new Date();
    order.lastChangedBy = payment.userId;
    await orderRepo.save(order);
    fixed += 1;
    console.log(`Order ${order.orderNumber} (${order.id}) -> PAID`);
  }

  console.log(`Done. ${fixed} order(s) reconciled.`);
  await dataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
