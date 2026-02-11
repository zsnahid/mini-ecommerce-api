import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { config } from 'dotenv';
import { User } from '../users/entities/user.entity';
import { Product } from '../admin/entities/product.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { UserSeeder } from './seeds/user.seeder';
import { ProductSeeder } from './seeds/product.seeder';

config();

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ecommerce',
  entities: [User, Product, Cart, CartItem, Order, OrderItem],
  namingStrategy: new SnakeNamingStrategy(),
  seeds: [UserSeeder, ProductSeeder],
};

export const dataSource = new DataSource(options);
