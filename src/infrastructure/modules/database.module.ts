import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// DataSource
import { AppDataSource } from '@infrastructure/database/data-source';

// Entity imports
import { UserEntity } from '@infrastructure/database/entities/user.entity';
import { ProductEntity } from '@infrastructure/database/entities/product.entity';
import { CategoryEntity } from '@infrastructure/database/entities/category.entity';

// Unit of Work
import { UnitOfWork } from '@infrastructure/database/unit-of-work';

@Global()
@Module({
  imports: [
    // TypeORM configuration using DataSource
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        database: configService.get('DB_NAME'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        entities: [UserEntity, ProductEntity, CategoryEntity],
        // migrations: ['dist/infrastructure/database/migrations/*.js'],
        migrationsRun: configService.get('NODE_ENV') !== 'development',
        synchronize: configService.get('NODE_ENV') === 'development', // Always use migrations in production
        logging: configService.get('NODE_ENV') === 'development',
        ssl:
          configService.get('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
        extra: {
          connectionLimit: 10,
          acquireConnectionTimeout: 60000,
          timeout: 60000,
          reconnect: true,
        },
      }),
      inject: [ConfigService],
    }),

    // Register entities for repository injection
    TypeOrmModule.forFeature([UserEntity, ProductEntity, CategoryEntity]),
  ],
  providers: [
    // DataSource provider for direct access when needed
    {
      provide: 'DATA_SOURCE',
      useFactory: async () => {
        if (!AppDataSource.isInitialized) {
          await AppDataSource.initialize();
        }
        return AppDataSource;
      },
    },

    // Unit of Work implementation
    {
      provide: 'IUnitOfWork',
      useClass: UnitOfWork,
    },

    UnitOfWork,
  ],
  exports: ['DATA_SOURCE', UnitOfWork, TypeOrmModule],
})
export class DatabaseModule {}
