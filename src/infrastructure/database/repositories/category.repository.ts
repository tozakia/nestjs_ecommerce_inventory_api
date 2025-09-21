import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ICategoryRepository } from '@domain/repositories/category.repository.interface';
import { BaseRepository } from '@infrastructure/database/repositories/base.repository';
import { CategoryEntity } from '@infrastructure/database/entities/category.entity';

@Injectable()
export class CategoryRepository
  extends BaseRepository<CategoryEntity, number>
  implements ICategoryRepository
{
  constructor(
    repository: Repository<CategoryEntity> | EntityManager,
    dataSource: DataSource,
  ) {
    const repo =
      repository instanceof EntityManager
        ? repository.getRepository(CategoryEntity)
        : repository;
    super(repo, repository instanceof EntityManager ? repository : undefined);
  }

  async findByName(name: string): Promise<CategoryEntity | null> {
    return await this.repository.findOne({ where: { name } });
  }

  async findAllWithProductCount(): Promise<CategoryEntity[]> {
    const categories = await this.repository
      .createQueryBuilder('category')
      .loadRelationCountAndMap('category.productCount', 'category.products')
      .getMany();

    return categories;
  }

  async hasProducts(categoryId: number): Promise<boolean> {
    const count = await this.repository
      .createQueryBuilder('category')
      .leftJoin('category.products', 'product')
      .where('category.id = :categoryId', { categoryId })
      .andWhere('product.id IS NOT NULL')
      .getCount();

    return count > 0;
  }
}
