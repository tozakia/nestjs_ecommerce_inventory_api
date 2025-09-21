import {
  DeepPartial,
  EntityManager,
  FindOptionsWhere,
  FindManyOptions,
  Repository,
} from 'typeorm';
import { BaseEntity } from '@domain/entities/base.entity';
import { IBaseRepository } from '@domain/repositories/base.repository.interface';

export abstract class BaseRepository<T extends BaseEntity, TId = string>
  implements IBaseRepository<T, TId>
{
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly entityManager?: EntityManager,
  ) {}

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async findById(id: TId): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
    });
  }

  async findOne(where: FindOptionsWhere<T>): Promise<T | null> {
    return this.repository.findOne({ where });
  }

  async findMany(where: FindOptionsWhere<T>): Promise<T[]> {
    return this.repository.find({ where });
  }

  async create(entity: Partial<T>): Promise<T> {
    const newEntity = this.repository.create(entity as DeepPartial<T>);
    return this.repository.save(newEntity);
  }

  async update(id: TId, entity: Partial<T>): Promise<T | null> {
    const updateResult = await this.repository.update(id as any, entity as any);

    if (updateResult.affected && updateResult.affected > 0) {
      return this.findById(id);
    }

    return null;
  }

  async delete(id: TId): Promise<boolean> {
    const result = await this.repository.delete(id as any);
    return (result.affected ?? 0) > 0;
  }

  async exists(id: TId): Promise<boolean> {
    const count = await this.repository.count({
      where: { id } as FindOptionsWhere<T>,
    });
    return count > 0;
  }

  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count(where ? { where } : {});
  }

  // Batch operations
  async createMany(entities: Partial<T>[]): Promise<T[]> {
    const newEntities = this.repository.create(entities as DeepPartial<T[]>);
    return this.repository.save(newEntities);
  }

  async deleteMany(ids: TId[]): Promise<number> {
    const result = await this.repository.delete(ids as any[]);
    return result.affected || 0;
  }

  // Transaction support
  async withTransaction<TResult>(
    operation: (repository: Repository<T>) => Promise<TResult>,
  ): Promise<TResult> {
    if (this.entityManager) {
      const transactionalRepo = this.entityManager.getRepository(
        this.repository.target,
      );
      return operation(transactionalRepo);
    }
    return operation(this.repository);
  }
}
