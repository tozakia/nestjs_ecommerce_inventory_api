import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntitySchema } from '@infrastructure/database/entities/base.entity';
import { ProductEntity } from '@infrastructure/database/entities/product.entity';

@Entity('categories')
export class CategoryEntity extends BaseEntitySchema {
  @Column({ unique: true })
  @Index()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => ProductEntity, (product) => product.category)
  products: ProductEntity[];
}
