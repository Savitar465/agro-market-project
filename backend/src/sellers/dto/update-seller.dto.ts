import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CoordsDto {
  @ApiProperty()
  @IsNumber()
  lat: number;

  @ApiProperty()
  @IsNumber()
  lng: number;
}

export class UpdateSellerDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

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

