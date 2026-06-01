import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CART_SERVICE } from '../../common/tokens';
import { ICartService } from '../../cart/services/cart.service.interface';
import { Payment } from '../entities/payment.entity';
import { PaymentMethod, PaymentStatus } from '../entities/payment-status.enum';
import { CreateCheckoutSessionDto } from '../dto/create-checkout-session.dto';
import {
  CheckoutSessionResult,
  IPaymentsService,
  PaymentStatusResult,
} from './payments.service.interface';
import { StripeService } from './stripe.service';
import { configService } from '../../config/config.service';

@Injectable()
export class PaymentsService implements IPaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly config = configService.getStripeConfig();

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @Inject(CART_SERVICE)
    private readonly cartService: ICartService,
    private readonly stripe: StripeService,
  ) {}

  async createCheckoutSession(
    userId: string,
    dto: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResult> {
    const cart = await this.cartService.getOpenCart(userId);
    const items = (cart.items ?? []).filter(
      (item) => item.isActive && !item.isArchived,
    );

    if (items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const amount = Number(cart.total);
    const currency = this.config.currency;
    const method = dto.method ?? PaymentMethod.CARD;

    const payment = this.paymentRepo.create({
      userId,
      cartId: cart.id,
      provider: this.stripe.isMock ? 'mock' : 'stripe',
      method,
      status: PaymentStatus.PENDING,
      amount,
      currency,
      createdBy: userId,
      lastChangedBy: userId,
    });
    await this.paymentRepo.save(payment);

    const successUrl = `${this.config.frontendUrl}/checkout/success?payment=${payment.id}`;
    const cancelUrl = `${this.config.frontendUrl}/cart`;

    const session = await this.stripe.createCheckoutSession({
      currency,
      customerEmail: cart.user?.email,
      successUrl,
      cancelUrl,
      metadata: {
        userId,
        cartId: cart.id,
        paymentId: payment.id,
      },
      lineItems: items.map((item) => ({
        name: item.product?.name ?? 'Producto',
        description: item.product?.unit ?? undefined,
        // Stripe expects the amount in the smallest currency unit (cents).
        unitAmount: Math.round(Number(item.unitPrice) * 100),
        quantity: Number(item.quantity),
      })),
    });

    // In mock mode there is no hosted Stripe page, so we point the buyer at a
    // local simulated-payment screen that calls the confirm-mock endpoint.
    const checkoutUrl = this.stripe.isMock
      ? `${this.config.frontendUrl}/checkout/pay?payment=${payment.id}`
      : session.url;

    payment.sessionId = session.id;
    payment.checkoutUrl = checkoutUrl;
    await this.paymentRepo.save(payment);

    return {
      paymentId: payment.id,
      sessionId: payment.sessionId,
      url: checkoutUrl,
      method,
      amount,
      currency,
      mock: this.stripe.isMock,
    };
  }

  async getStatus(
    userId: string,
    paymentId: string,
  ): Promise<PaymentStatusResult> {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
    });
    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }
    if (payment.userId !== userId) {
      throw new ForbiddenException('This payment does not belong to you');
    }
    return this.toStatus(payment);
  }

  async confirmMock(
    userId: string,
    paymentId: string,
  ): Promise<PaymentStatusResult> {
    if (!this.stripe.isMock) {
      throw new ForbiddenException(
        'Mock confirmation is disabled when Stripe is configured',
      );
    }

    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
    });
    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }
    if (payment.userId !== userId) {
      throw new ForbiddenException('This payment does not belong to you');
    }

    await this.markPaid(payment);
    return this.toStatus(payment);
  }

  async handleWebhook(
    rawBody: Buffer,
    signature: string,
  ): Promise<{ received: true }> {
    const event = this.stripe.constructEvent(rawBody, signature);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as {
          metadata?: Record<string, string>;
        };
        const paymentId = session.metadata?.paymentId;
        if (paymentId) {
          const payment = await this.paymentRepo.findOne({
            where: { id: paymentId },
          });
          if (payment) {
            await this.markPaid(payment);
          }
        }
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object as {
          metadata?: Record<string, string>;
        };
        const paymentId = session.metadata?.paymentId;
        if (paymentId) {
          await this.paymentRepo.update(
            { id: paymentId, status: PaymentStatus.PENDING },
            { status: PaymentStatus.CANCELED },
          );
        }
        break;
      }
      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }

    return { received: true };
  }

  /**
   * Idempotently finalizes a payment: discounts stock + marks the cart
   * purchased, then records the payment as PAID. Safe to call more than once
   * (Stripe may deliver the same webhook multiple times).
   */
  private async markPaid(payment: Payment): Promise<void> {
    if (payment.status === PaymentStatus.PAID) {
      return;
    }

    try {
      await this.cartService.checkout(payment.userId);
    } catch (error) {
      // The buyer was already charged, so we still record the payment as PAID
      // but flag the inventory failure for manual reconciliation/refund.
      this.logger.error(
        `Payment ${payment.id} captured but cart checkout failed: ${
          error instanceof Error ? error.message : String(error)
        }. Manual reconciliation required.`,
      );
      payment.internalComment = 'PAID but cart checkout failed — reconcile.';
    }

    payment.status = PaymentStatus.PAID;
    payment.paidAt = new Date();
    payment.lastChangedBy = payment.userId;
    await this.paymentRepo.save(payment);
  }

  private toStatus(payment: Payment): PaymentStatusResult {
    return {
      paymentId: payment.id,
      status: payment.status,
      method: payment.method,
      amount: Number(payment.amount),
      currency: payment.currency,
      paidAt: payment.paidAt ?? null,
    };
  }
}
