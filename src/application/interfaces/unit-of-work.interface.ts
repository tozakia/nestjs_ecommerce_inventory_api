import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { IProductRepository } from '@domain/repositories/product.repository.interface';
import { ICategoryRepository } from '@domain/repositories/category.repository.interface';

export interface IUnitOfWork {
  // Repository access
  readonly users: IUserRepository;
  readonly products: IProductRepository;
  readonly categories: ICategoryRepository;

  // Transaction control
  startTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;

  // Convenience method for automatic transaction handling
  withTransaction<T>(operation: () => Promise<T>): Promise<T>;
}
