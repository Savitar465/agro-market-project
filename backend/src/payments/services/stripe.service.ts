import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { configService } from '../../config/config.service';

export type StripeLineItem = {
  name: string;
  description?: string;
  unitAmount: number; // in the smallest currency unit (e.g. cents)
  quantity: number;
};

export type CreateSessionParams = {
  lineItems: StripeLineItem[];
  currency: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
};

export type CreatedSession = {
  id: string;
  url: string;
};

/**
 * Thin wrapper over the Stripe SDK. When no STRIPE_SECRET_KEY is configured it
 * runs in "mock" mode: sessions resolve to a local simulated-payment page and
 * webhook verification is bypassed, so the full flow is testable in dev.
 */
@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly config = configService.getStripeConfig();
  private readonly stripe: Stripe.Stripe | null;

  constructor() {
    // Pin to the SDK's bundled API version (omitting `apiVersion` uses it).
    this.stripe = this.config.mock ? null : new Stripe(this.config.secretKey);

    if (this.config.mock) {
      this.logger.warn(
        'STRIPE_SECRET_KEY not set — payments run in MOCK mode (no real charges).',
      );
    }
  }

  get isMock(): boolean {
    return this.config.mock;
  }

  async createCheckoutSession(
    params: CreateSessionParams,
  ): Promise<CreatedSession> {
    if (!this.stripe) {
      // Mock mode: hand back a synthetic id; the URL is set by the caller to a
      // local simulated-payment page, so we leave it empty here.
      const id = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      return { id, url: '' };
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: params.customerEmail,
      line_items: params.lineItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: params.currency,
          unit_amount: item.unitAmount,
          product_data: {
            name: item.name,
            ...(item.description ? { description: item.description } : {}),
          },
        },
      })),
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
    });

    return { id: session.id, url: session.url ?? '' };
  }

  /**
   * Verifies and parses a Stripe webhook payload. Throws if the signature is
   * invalid. Never called in mock mode.
   */
  constructEvent(rawBody: Buffer, signature: string) {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.config.webhookSecret,
    );
  }
}
