import { dataSource } from '../database/data-source';
import { runSeeders } from 'typeorm-extension';

(async () => {
  try {
    console.log('Initializing Data Source...');
    await dataSource.initialize();
    console.log('Data Source Initialized.');

    console.log('Running Seeders...');
    await runSeeders(dataSource);
    console.log('Seeding Complete.');

    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
})();
