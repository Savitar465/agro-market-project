import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './controller/payments.controller';
import { PaymentsService } from './services/payments.service';
import { StripeService } from './services/stripe.service';
import { PAYMENTS_SERVICE } from '../common/tokens';
import { Payment } from './entities/payment.entity';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), CartModule],
  controllers: [PaymentsController],
  providers: [
    StripeService,
    { provide: PAYMENTS_SERVICE, useClass: PaymentsService },
  ],
  exports: [PAYMENTS_SERVICE],
})
export class PaymentsModule {}
