import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntitySchema } from '@infrastructure/database/entities/base.entity';
import { CategoryEntity } from '@infrastructure/database/entities/category.entity';

@Entity('products')
export class ProductEntity extends BaseEntitySchema {
  @Column()
  @Index()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  stock: number;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column()
  @Index()
  categoryId: number;

  @ManyToOne(() => CategoryEntity, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: CategoryEntity;
}
