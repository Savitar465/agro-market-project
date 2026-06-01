import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod } from '../entities/payment-status.enum';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    enum: PaymentMethod,
    default: PaymentMethod.CARD,
    description:
      "'card' redirects to the hosted payment page; 'qr' renders the same payment URL as a scannable QR code.",
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method: PaymentMethod = PaymentMethod.CARD;
}
