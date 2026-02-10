import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Check,
  Unique,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../../admin/entities/product.entity';

@Entity('cart_items')
@Check(`"quantity" > 0`)
@Unique(['cart', 'product'])
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'integer' })
  quantity: number;
}
