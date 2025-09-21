import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { SupabaseStorageService } from '@infrastructure/storage/supabase-storage.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        limits: {
          fileSize: configService.get<number>('MAX_FILE_SIZE', 5 * 1024 * 1024),
          files: 5, // Maximum 5 files per request
        },
        fileFilter: (req, file, callback) => {
          const allowedTypes = configService
            .get<string>(
              'ALLOWED_FILE_TYPES',
              'image/jpeg,image/png,image/webp',
            )
            .split(',');

          if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
          } else {
            callback(
              new Error(`File type not allowed: ${file.mimetype}`),
              false,
            );
          }
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: 'IStorageService',
      useFactory: (configService: ConfigService) => {
        return new SupabaseStorageService(configService);
      },
      inject: [ConfigService],
    },
    SupabaseStorageService,
  ],
  exports: ['IStorageService', SupabaseStorageService, MulterModule],
})
export class StorageModule {}
