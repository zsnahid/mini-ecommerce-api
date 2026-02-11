import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

export class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    // Create Admin User
    const adminEmail = 'admin@example.com';
    const existingAdmin = await userRepository.findOneBy({ email: adminEmail });

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash('admin123#', salt);

      const admin = userRepository.create({
        email: adminEmail,
        passwordHash,
        role: UserRole.ADMIN,
      });
      await userRepository.save(admin);
      console.log('Created admin user');
    }

    // Create Customer Users
    const customersToCreate = 10;
    const salt = await bcrypt.genSalt();
    const defaultPasswordHash = await bcrypt.hash('password123#', salt);

    const customers: User[] = [];

    for (let i = 0; i < customersToCreate; i++) {
      const email = faker.internet.email();
      // Check conflicts (simple check, for robust seeding could use a Set or retry)
      const exists = await userRepository.findOneBy({ email });
      if (!exists && !customers.find((c) => c.email === email)) {
        customers.push(
          userRepository.create({
            email,
            passwordHash: defaultPasswordHash,
            role: UserRole.CUSTOMER,
          }),
        );
      }
    }

    if (customers.length > 0) {
      await userRepository.save(customers);
      console.log(`Created ${customers.length} customer users`);
    }
  }
}
