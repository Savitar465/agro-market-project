import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/payment-status.enum';
import { OrderShippingDto } from '../../orders/dto/order-shipping.dto';

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

  @ApiPropertyOptional({
    type: OrderShippingDto,
    description: 'Shipping details stored on the order for the receipt.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OrderShippingDto)
  shipping?: OrderShippingDto;
}
