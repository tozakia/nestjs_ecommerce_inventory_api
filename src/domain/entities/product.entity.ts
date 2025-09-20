import { BaseEntity } from '@domain/entities/base.entity';
import { Category } from '@domain/entities/category.entity';

export class Product extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categoryId: number;
  category?: Category;
}
