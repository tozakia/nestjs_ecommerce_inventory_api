import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Category } from '@domain/entities/category.entity';
import { UnitOfWork } from '@infrastructure/database/unit-of-work';
import type { IUnitOfWork } from '@application/interfaces/unit-of-work.interface';
import { CreateCategoryDto } from '@application/dtos/category/create-category.dto';
import { UpdateCategoryDto } from '@application/dtos/category/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(UnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Check if category name exists
    const existing = await this.unitOfWork.categories.findByName(
      createCategoryDto.name,
    );
    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }

    return this.unitOfWork.categories.create(createCategoryDto);
  }
}
