import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { BaseRepository } from '@infrastructure/database/repositories/base.repository';
import { UserEntity } from '@infrastructure/database/entities/user.entity';

@Injectable()
export class UserRepository
  extends BaseRepository<UserEntity, number>
  implements IUserRepository
{
  constructor(
    repository: Repository<UserEntity> | EntityManager,
    dataSource: DataSource,
  ) {
    const repo =
      repository instanceof EntityManager
        ? repository.getRepository(UserEntity)
        : repository;
    super(repo, repository instanceof EntityManager ? repository : undefined);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.repository.count({ where: { username } });
    return count > 0;
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string | null,
  ): Promise<void> {
    if (refreshToken) {
      await this.repository.update(userId, {
        refreshToken,
      });
    }
  }
}
