import { IsNotEmpty, Min, IsInt } from 'class-validator';

export class AddToCartDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  productId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}
