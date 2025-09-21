import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IStorageService } from '@application/interfaces/storage.service.interface';

@Injectable()
export class SupabaseStorageService implements IStorageService {
  private readonly supabase: SupabaseClient;
  private readonly bucket: string;
  private readonly configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;

    const url = this.configService.get<string>('SUPABASE_URL');
    const serviceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    const bucket = this.configService.get<string>('SUPABASE_STORAGE_BUCKET');

    if (!url || !serviceKey || !bucket) {
      throw new Error('Missing required Supabase configuration');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.supabase = createClient(url, serviceKey);
    this.bucket = bucket;
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    if (!file?.buffer || !file.originalname) {
      throw new Error('Invalid file provided');
    }

    const fileName = `${folder}/${Date.now()}-${file.originalname.replace(/[^\w\d.-]/g, '_')}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
        cacheControl: '3600',
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    return this.getPublicUrl(fileName);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const fileName = this.extractFileName(fileUrl);
      const { error } = await this.supabase.storage
        .from(this.bucket)
        .remove([fileName]);

      if (error) {
        throw new Error(`Failed to delete file: ${error.message}`);
      }
    } catch (error) {
      throw new Error(
        `Error deleting file: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  getPublicUrl(fileName: string): string {
    if (!fileName) {
      throw new Error('File name is required');
    }

    const { data } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(fileName);

    if (!data?.publicUrl) {
      throw new Error('Failed to generate public URL');
    }

    return data.publicUrl;
  }

  private extractFileName(fileUrl: string): string {
    if (!fileUrl) {
      throw new Error('File URL is required');
    }

    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    if (!supabaseUrl) {
      throw new Error('Supabase URL is not configured');
    }

    const baseUrl = `${supabaseUrl}/storage/v1/object/public/${this.bucket}/`;
    const fileName = fileUrl.replace(baseUrl, '');

    if (fileName === fileUrl) {
      throw new Error('Invalid Supabase file URL format');
    }

    return fileName;
  }
}
