import { Controller, Post, Body } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AddToCartDto } from './dto/add-to-cart.dto';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('customer')
@Roles(UserRole.CUSTOMER)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('cart/items')
  async addToCart(
    @CurrentUser() user: JwtPayload,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return await this.customerService.addToCart(user.userId, addToCartDto);
  }
}
