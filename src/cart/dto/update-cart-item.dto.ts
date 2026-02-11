import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'New quantity for the cart item',
    example: 3,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}
