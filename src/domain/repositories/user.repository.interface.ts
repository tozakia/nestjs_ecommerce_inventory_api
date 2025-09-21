import { User } from '@domain/entities/user.entity';
import { IBaseRepository } from '@domain/repositories/base.repository.interface';

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
  existsByUsername(username: string): Promise<boolean>;
  updateRefreshToken(
    userId: number,
    refreshToken: string | null,
  ): Promise<void>;
}
