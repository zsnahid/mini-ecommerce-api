import { Controller, Post, Get, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  async placeOrder(@Req() req) {
    return this.ordersService.placeOrder(req.user);
  }

  @Get()
  @Roles(UserRole.CUSTOMER)
  async findAll(@Req() req) {
    return this.ordersService.findAll(req.user);
  }
}
