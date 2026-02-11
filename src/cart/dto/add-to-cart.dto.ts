import { IsNotEmpty, Min, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({
    description: 'Product ID to add to cart',
    example: 1,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({
    description: 'Quantity to add',
    example: 2,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}
