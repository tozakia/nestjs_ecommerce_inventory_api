import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ProductFilter,
  PaginationOptions,
  PaginationResult,
} from '@domain/value-objects/pagination.vo';
import { Product } from '@domain/entities/product.entity';
import { IProductRepository } from '@domain/repositories/product.repository.interface';
import { BaseRepository } from '@infrastructure/database/repositories/base.repository';
import { ProductEntity } from '@infrastructure/database/entities/product.entity';

@Injectable()
export class ProductRepository
  extends BaseRepository<ProductEntity, number>
  implements IProductRepository
{
  constructor(
    @InjectRepository(ProductEntity)
    repository: Repository<ProductEntity>,
    @Inject('DATA_SOURCE')
    private dataSource: DataSource,
  ) {
    super(repository, undefined);
  }

  async findWithFilters(
    filters: ProductFilter,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<Product>> {
    const { page, limit } = pagination;
    const { categoryId, minPrice, maxPrice } = filters;

    let queryBuilder = this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (categoryId) {
      queryBuilder = queryBuilder.andWhere('product.categoryId = :categoryId', {
        categoryId,
      });
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: minPrice,
        maxPrice: maxPrice,
      });
    } else if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', {
        minPrice: minPrice,
      });
    } else if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', {
        maxPrice: maxPrice,
      });
    }

    const offset = (page - 1) * limit;
    const [products, total] = await queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      items: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async searchProducts(
    query: string,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<Product>> {
    const { page, limit } = pagination;

    const queryBuilder = this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where(
        '(LOWER(product.name) LIKE LOWER(:query) OR LOWER(product.description) LIKE LOWER(:query))',
        { query: `%${query}%` },
      );

    const offset = (page - 1) * limit;
    const [products, total] = await queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      items: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCategoryId(categoryId: number): Promise<Product[]> {
    return await this.repository.find({
      where: { categoryId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByIdWithCategory(id: number): Promise<Product | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async updateStock(id: number, quantity: number): Promise<void> {
    await this.repository.update(id, { stock: quantity });
  }

  async decrementStock(id: number, quantity: number): Promise<void> {
    await this.repository.decrement({ id }, 'stock', quantity);
  }

  async incrementStock(id: number, quantity: number): Promise<void> {
    await this.repository.increment({ id }, 'stock', quantity);
  }
}
