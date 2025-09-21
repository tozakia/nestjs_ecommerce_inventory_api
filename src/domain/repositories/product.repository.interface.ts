import { Product } from '@domain/entities/product.entity';
import { IBaseRepository } from '@domain/repositories/base.repository.interface';
import {
  PaginationOptions,
  PaginationResult,
  ProductFilter,
} from '@domain/value-objects/pagination.vo';

export interface IProductRepository extends IBaseRepository<Product> {
  findWithFilters(
    filters: ProductFilter,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<Product>>;

  searchProducts(
    query: string,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<Product>>;

  findByCategoryId(categoryId: number): Promise<Product[]>;
  findByIdWithCategory(categoryId: number): Promise<Product | null>;
  updateStock(id: number, quantity: number): Promise<void>;
  decrementStock(id: number, quantity: number): Promise<void>;
  incrementStock(id: number, quantity: number): Promise<void>;
}
