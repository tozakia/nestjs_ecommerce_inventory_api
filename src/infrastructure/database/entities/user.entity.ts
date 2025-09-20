import { Entity, Column, Index } from 'typeorm';
import { BaseEntitySchema } from '@infrastructure/database/entities/base.entity';

@Entity('users')
export class UserEntity extends BaseEntitySchema {
  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ unique: true })
  @Index()
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  refreshToken?: string;
}
