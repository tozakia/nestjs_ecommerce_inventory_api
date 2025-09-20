import { BaseEntity } from '@domain/entities/base.entity';

export class User extends BaseEntity {
  email: string;
  username: string;
  password: string;
  refreshToken?: string;
}
