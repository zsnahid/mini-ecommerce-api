import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
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
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async placeOrder(user: User): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const cart = await manager.findOne(Cart, {
        where: { user: { id: user.id } },
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
      const order = new Order();
      order.user = user;
      order.totalAmount = totalAmount;
      order.status = OrderStatus.PENDING;
      order.items = orderItems;

      const savedOrder = await manager.save(Order, order);

      // Clear Cart Items
      await manager.delete(CartItem, { cart: { id: cart.id } });

      return savedOrder;
    });
  }

  async findAll(user: User): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user: { id: user.id } },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }
}
