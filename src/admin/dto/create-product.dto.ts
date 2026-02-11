import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Mouse',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'Ergonomic wireless mouse with 2.4GHz connectivity',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Product price in USD',
    example: 29.99,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Available stock quantity',
    example: 100,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock: number;
}
