import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Product, ProductStatus } from '../../admin/entities/product.entity';
import { faker } from '@faker-js/faker';

export class ProductSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const productRepository = dataSource.getRepository(Product);

    // Check if products exist to avoid over-seeding on multiple runs (optional)
    // const count = await productRepository.count();
    // if (count > 0) {
    //   console.log('Products already exist, skipping product seeding');
    //   return;
    // }

    const products: Product[] = [];
    const productsToCreate = 20;

    for (let i = 0; i < productsToCreate; i++) {
      products.push(
        productRepository.create({
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
          stock: faker.number.int({ min: 0, max: 100 }),
          status: faker.helpers.arrayElement([
            ProductStatus.ACTIVE,
            ProductStatus.ACTIVE, // Weighted to be active
            ProductStatus.DELETED,
          ]),
        }),
      );
    }

    await productRepository.save(products);
    console.log(`Created ${products.length} products`);
  }
}
