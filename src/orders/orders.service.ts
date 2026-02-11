import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Product, ProductStatus } from '../admin/entities/product.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async placeOrder(user: any): Promise<Order> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        // Fetch the full user entity from the JWT payload
        const fullUser = await manager.findOne(User, {
          where: { id: user.userId },
        });

        if (!fullUser) {
          throw new NotFoundException('User not found');
        }

        const cart = await manager.findOne(Cart, {
          where: { user: { id: fullUser.id } },
          relations: ['items', 'items.product'],
        });

        if (!cart || !cart.items || cart.items.length === 0) {
          throw new BadRequestException('Cart is empty');
        }

        let totalAmount = 0;
        const orderItems: OrderItem[] = [];

        for (const cartItem of cart.items) {
          // Pessimistic Lock to ensure stock integrity within the transaction
          const product = await manager.findOne(Product, {
            where: { id: cartItem.product.id },
            lock: { mode: 'pessimistic_write' },
          });

          if (!product) {
            throw new NotFoundException(
              `Product ${cartItem.product.id} not found`,
            );
          }

          if (product.status !== ProductStatus.ACTIVE) {
            throw new BadRequestException(
              `Product "${product.name}" is not active`,
            );
          }

          if (product.stock < cartItem.quantity) {
            throw new ConflictException(
              `Insufficient stock for product "${product.name}"`,
            );
          }

          // Deduct stock
          product.stock -= cartItem.quantity;
          await manager.save(product);

          // Create Order Item snapshot
          const orderItem = new OrderItem();
          orderItem.product = product;
          orderItem.quantity = cartItem.quantity;
          orderItem.priceAtPurchase = product.price;

          totalAmount += Number(product.price) * cartItem.quantity;
          orderItems.push(orderItem);
        }

        // Create Order
        const order = manager.create(Order, {
          user: fullUser,
          totalAmount: totalAmount,
          status: OrderStatus.PENDING,
        });

        const savedOrder = await manager.save(order);

        // Associate items with the saved order and save them
        for (const item of orderItems) {
          item.order = savedOrder;
        }
        await manager.save(OrderItem, orderItems);

        // Force fetch the complete order with relations to return
        const finalOrder = await manager.findOne(Order, {
          where: { id: savedOrder.id },
          relations: ['items', 'items.product'],
        });

        if (!finalOrder) {
          throw new Error('Failed to retrieve saved order');
        }

        // Clear Cart Items
        await manager.delete(CartItem, { cart: { id: cart.id } });

        return finalOrder;
      });
    } catch (error) {
      this.logger.error(`Failed to place order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(user: any): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user: { id: user.userId } },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }
}
