import { Controller, Post, Get, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Place an order',
    description: "Creates a new order from the current user's shopping cart",
  })
  @ApiResponse({
    status: 201,
    description: 'Order placed successfully',
  })
  @ApiResponse({ status: 400, description: 'Cart is empty or invalid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async placeOrder(@Req() req) {
    return this.ordersService.placeOrder(req.user);
  }

  @Get()
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Get user orders',
    description: 'Retrieves all orders for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Req() req) {
    return this.ordersService.findAll(req.user);
  }
}
