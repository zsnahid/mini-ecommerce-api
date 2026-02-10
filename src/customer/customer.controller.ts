import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
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

  @Get('cart')
  async getCart(@CurrentUser() user: JwtPayload) {
    return await this.customerService.getCart(user.userId);
  }

  @Patch('cart/items/:id')
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

  @Delete('cart/items/:id')
  async removeCartItem(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return await this.customerService.removeCartItem(user.userId, +id);
  }
}
