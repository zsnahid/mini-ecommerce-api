import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CustomerService } from './cart.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('cart')
@Roles(UserRole.CUSTOMER)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('items')
  async addToCart(
    @CurrentUser() user: JwtPayload,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return await this.customerService.addToCart(user.userId, addToCartDto);
  }

  @Get()
  async getCart(@CurrentUser() user: JwtPayload) {
    return await this.customerService.getCart(user.userId);
  }

  @Patch('items/:id')
  async updateCartItem(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return await this.customerService.updateCartItem(
      user.userId,
      +id,
      updateCartItemDto,
    );
  }

  @Delete('items/:id')
  async removeCartItem(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return await this.customerService.removeCartItem(user.userId, +id);
  }

  @Delete()
  async clearCart(@CurrentUser() user: JwtPayload) {
    await this.customerService.clearCart(user.userId);
    return { message: 'Cart cleared successfully' };
  }
}
