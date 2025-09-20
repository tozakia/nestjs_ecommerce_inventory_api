import { BaseEntity } from '@domain/entities/base.entity';
import { Product } from '@domain/entities/product.entity';

export class Category extends BaseEntity {
  name: string;
  description?: string;
  products?: Product[];
  productCount?: number;
}
