import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async removeProduct(id: number): Promise<{ message: string }> {
    const product = await this.findOne(id);

    // TODO: Check if product has associated order history
    // Since Order/OrderItem entities are not yet implemented, we assume no history for now.
    // When implemented, hard delete should be blocked if history exists.
    const hasOrderHistory = false;

    if (hasOrderHistory) {
      product.status = ProductStatus.DELETED;
      await this.productRepository.save(product);
      return { message: 'Product soft-deleted due to existing order history' };
    } else {
      await this.productRepository.remove(product);
      return { message: 'Product hard-deleted successfully' };
    }
  }
}
