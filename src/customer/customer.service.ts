import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product, ProductStatus } from '../admin/entities/product.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  private async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ user: { id: userId } });
      cart = await this.cartRepository.save(cart);
      cart.items = [];
    }

    return cart;
  }

  async addToCart(userId: number, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productId, quantity } = addToCartDto;

    // Validate product exists and is active
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (product.status !== ProductStatus.ACTIVE) {
      throw new BadRequestException('Product is not available');
    }

    // Get or create user's cart
    const cart = await this.getOrCreateCart(userId);

    // Check if product already exists in cart
    const existingItem = cart.items.find(
      (item) => item.product.id === productId,
    );

    if (existingItem) {
      // Increment quantity
      const newQuantity = existingItem.quantity + quantity;

      // Validate stock availability
      if (newQuantity > product.stock) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${product.stock}, Requested: ${newQuantity}`,
        );
      }

      existingItem.quantity = newQuantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      // Validate stock availability
      if (quantity > product.stock) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
        );
      }

      // Create new cart item
      const cartItem = this.cartItemRepository.create({
        cart,
        product,
        quantity,
      });
      await this.cartItemRepository.save(cartItem);
    }

    // Return updated cart with items and product details
    return (await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
    }))!;
  }

  async getCart(userId: number): Promise<any> {
    const cart = await this.getOrCreateCart(userId);

    let totalItems = 0;
    let totalPrice = 0;

    if (cart.items) {
      for (const item of cart.items) {
        totalItems += item.quantity;
        totalPrice += item.quantity * Number(item.product.price);
      }
    }

    return {
      ...cart,
      totalItems,
      totalPrice: Number(totalPrice.toFixed(2)),
    };
  }
}
