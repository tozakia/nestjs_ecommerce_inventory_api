export interface IStorageService {
  uploadFile(file: Express.Multer.File, folder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
  getPublicUrl(fileName: string): string;
}
