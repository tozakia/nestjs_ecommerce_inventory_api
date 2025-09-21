import { Injectable, Inject } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IUnitOfWork } from '@application/interfaces/unit-of-work.interface';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { IProductRepository } from '@domain/repositories/product.repository.interface';
import { ICategoryRepository } from '@domain/repositories/category.repository.interface';
import { UserRepository } from '@infrastructure/database/repositories/user.repository';
import { ProductRepository } from '@infrastructure/database/repositories/product.repository';
import { CategoryRepository } from '@infrastructure/database/repositories/category.repository';
import { UserEntity } from '@infrastructure/database/entities/user.entity';
import { ProductEntity } from '@infrastructure/database/entities/product.entity';
import { CategoryEntity } from '@infrastructure/database/entities/category.entity';

@Injectable()
export class UnitOfWork implements IUnitOfWork {
  private queryRunner: QueryRunner | null = null;
  private _userRepository: IUserRepository | null = null;
  private _productRepository: IProductRepository | null = null;
  private _categoryRepository: ICategoryRepository | null = null;

  constructor(
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  // ============================================
  // REPOSITORY GETTERS WITH TRANSACTION SUPPORT
  // ============================================

  get users(): IUserRepository {
    if (!this._userRepository) {
      if (!this.dataSource) {
        throw new Error('DataSource is not initialized');
      }
      const repository = this.queryRunner
        ? this.queryRunner.manager.getRepository(UserEntity)
        : this.userRepository;
      this._userRepository = new UserRepository(repository, this.dataSource);
    }
    return this._userRepository;
  }

  get products(): IProductRepository {
    if (!this._productRepository) {
      if (!this.dataSource) {
        throw new Error('DataSource is not initialized');
      }
      const repository = this.queryRunner
        ? this.queryRunner.manager.getRepository(ProductEntity)
        : this.productRepository;
      this._productRepository = new ProductRepository(
        repository,
        this.dataSource,
      );
    }
    return this._productRepository;
  }

  get categories(): ICategoryRepository {
    if (!this._categoryRepository) {
      if (!this.dataSource) {
        throw new Error('DataSource is not initialized');
      }
      const repository = this.queryRunner
        ? this.queryRunner.manager.getRepository(CategoryEntity)
        : this.categoryRepository;
      this._categoryRepository = new CategoryRepository(
        repository,
        this.dataSource,
      );
    }
    return this._categoryRepository;
  }

  // ============================================
  // TRANSACTION MANAGEMENT
  // ============================================

  async startTransaction(): Promise<void> {
    if (this.queryRunner) {
      throw new Error('Transaction already started');
    }

    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();

    // Reset repository instances to use the transaction
    this._userRepository = null;
    this._productRepository = null;
    this._categoryRepository = null;
  }

  async commit(): Promise<void> {
    if (!this.queryRunner) {
      throw new Error('No active transaction to commit');
    }

    try {
      await this.queryRunner.commitTransaction();
    } finally {
      await this.queryRunner.release();
      this.queryRunner = null;
      this._resetRepositories();
    }
  }

  async rollback(): Promise<void> {
    if (!this.queryRunner) {
      throw new Error('No active transaction to rollback');
    }

    try {
      await this.queryRunner.rollbackTransaction();
    } finally {
      await this.queryRunner.release();
      this.queryRunner = null;
      this._resetRepositories();
    }
  }

  // ============================================
  // CONVENIENCE METHOD FOR AUTOMATIC TRANSACTION HANDLING
  // ============================================

  async withTransaction<T>(operation: () => Promise<T>): Promise<T> {
    await this.startTransaction();
    let result: T;

    try {
      result = await operation();
      await this.commit();
      return result;
    } catch (error) {
      try {
        await this.rollback();
      } catch (rollbackError) {
        // Log the rollback error but don't mask the original error
        console.error('Error during transaction rollback:', rollbackError);
      }
      throw error;
    }
  }

  private _resetRepositories(): void {
    this._userRepository = null;
    this._productRepository = null;
    this._categoryRepository = null;
  }
}
