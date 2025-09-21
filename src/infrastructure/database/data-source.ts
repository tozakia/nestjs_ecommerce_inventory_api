import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '@infrastructure/database/entities/user.entity';
import { ProductEntity } from '@infrastructure/database/entities/product.entity';
import { CategoryEntity } from '@infrastructure/database/entities/category.entity';

config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  database: configService.get('DB_NAME'),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  entities: [UserEntity, ProductEntity, CategoryEntity],
  // migrations: ['src/infrastructure/database/migrations/*.ts'],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
  ssl:
    configService.get('DB_SSL') === 'true'
      ? { rejectUnauthorized: false }
      : false,
});

// Initialize the data source
export const initializeDataSource = async (): Promise<DataSource> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected successfully');
    }
    return AppDataSource;
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    throw error;
  }
};
