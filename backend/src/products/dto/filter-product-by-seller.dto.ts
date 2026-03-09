import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterProductBySellerDto {
  @ApiProperty({ required: false, description: 'Seller ID to filter products' })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiProperty({ required: false, description: 'Search by product name (partial match)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false, description: 'Minimum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ required: false, description: 'Maximum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ required: false, description: 'Sort by field (name, price, rating, createDateTime)', default: 'createDateTime' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ required: false, description: 'Sort order (ASC or DESC)', default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @ApiProperty({ required: false, description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

