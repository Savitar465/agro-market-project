import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CoordsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  lat: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  lng: number;
}

export class CreateSellerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ type: 'string', required: false, description: 'User ID who owns this seller profile' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    type: 'object',
    properties: {
      lat: { type: 'number' },
      lng: { type: 'number' }
    }
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordsDto)
  coords?: CoordsDto;
}

