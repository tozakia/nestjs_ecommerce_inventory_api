import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Infrastructure modules
import { DatabaseModule } from '@infrastructure/modules/database.module';

// Application layer
import { CategoryService } from '@application/services/category.service';
import { ProductService } from '@application/services/product.service';

// Presentation layer
import { CategoryController } from '@presentation/controllers/category.controller';
import { ProductController } from '@presentation/controllers/product.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Infrastructure modules
    DatabaseModule,
  ],
  providers: [CategoryService, ProductService],
  controllers: [
    // AuthController,
    CategoryController,
    ProductController,
  ],
})
export class AppModule {}
