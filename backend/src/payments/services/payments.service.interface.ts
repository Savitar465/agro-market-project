import { CreateCheckoutSessionDto } from '../dto/create-checkout-session.dto';
import { PaymentMethod, PaymentStatus } from '../entities/payment-status.enum';

export type CheckoutSessionResult = {
  paymentId: string;
  sessionId: string | null;
  url: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  // True when running without Stripe credentials (simulated payment).
  mock: boolean;
};

export type PaymentStatusResult = {
  paymentId: string;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
  currency: string;
  paidAt?: Date | null;
};

export interface IPaymentsService {
  createCheckoutSession(
    userId: string,
    dto: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResult>;
  getStatus(userId: string, paymentId: string): Promise<PaymentStatusResult>;
  confirmMock(userId: string, paymentId: string): Promise<PaymentStatusResult>;
  handleWebhook(
    rawBody: Buffer,
    signature: string,
  ): Promise<{ received: true }>;
}
