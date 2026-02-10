import {
    Entity,
    PrimaryGeneratedColumn, UpdateDateColumn,
    OneToOne,
    OneToMany,
    JoinColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';


@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, { cascade: true })
  items: CartItem[];

  @UpdateDateColumn()
  updatedAt: Date;
}
