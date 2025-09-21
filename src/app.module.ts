import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Infrastructure modules
import { DatabaseModule } from '@infrastructure/modules/database.module';

// Application layer
import { AuthService } from '@application/services/auth.service';
import { CategoryService } from '@application/services/category.service';
import { ProductService } from '@application/services/product.service';

// Presentation layer
import { AuthController } from '@presentation/controllers/auth.controller';
import { CategoryController } from '@presentation/controllers/category.controller';
import { ProductController } from '@presentation/controllers/product.controller';

// Strategies
import { JwtStrategy } from '@presentation/strategies/jwt.strategy';
import { JwtRefreshStrategy } from '@presentation/strategies/jwt-refresh.strategy';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // JWT configuration
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),

    // Infrastructure modules
    DatabaseModule,

    // Auth modules
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [
    AuthService,
    CategoryService,
    ProductService,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  controllers: [AuthController, CategoryController, ProductController],
})
export class AppModule {}
