import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateStockDto {
  @ApiProperty({ description: 'New absolute stock quantity' })
  @IsNumber()
  @Min(0)
  stock: number;
}
