import { Category } from '@domain/entities/category.entity';
import { IBaseRepository } from '@domain/repositories/base.repository.interface';

export interface ICategoryRepository extends IBaseRepository<Category> {
  findByName(name: string): Promise<Category | null>;
  findAllWithProductCount(): Promise<Category[]>;
  hasProducts(categoryId: number): Promise<boolean>;
}
