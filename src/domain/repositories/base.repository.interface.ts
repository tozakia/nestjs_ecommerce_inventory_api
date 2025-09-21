import { FindOptionsWhere, FindManyOptions } from 'typeorm';

export interface IBaseRepository<T, TId = number> {
  findAll(options?: FindManyOptions<T>): Promise<T[]>;
  findById(id: TId): Promise<T | null>;
  findOne(where: FindOptionsWhere<T>): Promise<T | null>;
  findMany(where: FindOptionsWhere<T>): Promise<T[]>;
  create(entity: Partial<T>): Promise<T>;
  update(id: TId, entity: Partial<T>): Promise<T>;
  delete(id: TId): Promise<boolean>;
  exists(id: TId): Promise<boolean>;
  count(where?: FindOptionsWhere<T>): Promise<number>;
}
