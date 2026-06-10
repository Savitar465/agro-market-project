import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class OrdersQueryDto {
  @ApiPropertyOptional({
    description: 'Only orders created on or after this date (ISO 8601).',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description:
      'Only orders created on or before this date (ISO 8601). ' +
      'A date-only value includes the whole day.',
    example: '2026-01-31',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
