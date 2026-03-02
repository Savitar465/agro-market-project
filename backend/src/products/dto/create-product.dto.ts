import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;
}
