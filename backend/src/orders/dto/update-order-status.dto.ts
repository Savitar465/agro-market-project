import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../entities/order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    description:
      'New fulfillment status. Only forward transitions are allowed ' +
      '(PAID -> PROCESSING -> SHIPPED -> DELIVERED, or CANCELED).',
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
