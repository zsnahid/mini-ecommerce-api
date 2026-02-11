import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CustomerService } from './cart.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Cart')
@ApiBearerAuth('JWT-auth')
@Controller('cart')
@Roles(UserRole.CUSTOMER)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('items')
  @ApiOperation({
    summary: 'Add item to cart',
    description:
      'Adds a product to the shopping cart or updates quantity if already exists',
  })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async addToCart(
    @CurrentUser() user: JwtPayload,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return await this.customerService.addToCart(user.userId, addToCartDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get shopping cart',
    description: "Retrieves the current user's shopping cart with all items",
  })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCart(@CurrentUser() user: JwtPayload) {
    return await this.customerService.getCart(user.userId);
  }

  @Patch('items/:id')
  @ApiOperation({
    summary: 'Update cart item',
    description: 'Updates the quantity of a specific item in the cart',
  })
  @ApiParam({ name: 'id', description: 'Cart item ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Cart item updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
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
  @ApiOperation({
    summary: 'Remove cart item',
    description: 'Removes a specific item from the shopping cart',
  })
  @ApiParam({ name: 'id', description: 'Cart item ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Cart item removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async removeCartItem(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return await this.customerService.removeCartItem(user.userId, +id);
  }

  @Delete()
  @ApiOperation({
    summary: 'Clear cart',
    description: 'Removes all items from the shopping cart',
  })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async clearCart(@CurrentUser() user: JwtPayload) {
    await this.customerService.clearCart(user.userId);
    return { message: 'Cart cleared successfully' };
  }
}
