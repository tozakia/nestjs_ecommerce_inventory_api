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

    return await this.unitOfWork.categories.create(createCategoryDto);
  }

  async findAll(): Promise<Category[]> {
    return await this.unitOfWork.categories.findAllWithProductCount();
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.unitOfWork.categories.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category | null> {
    const category = await this.unitOfWork.categories.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existing = await this.unitOfWork.categories.findByName(
        updateCategoryDto.name,
      );
      if (existing) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    return await this.unitOfWork.categories.update(id, updateCategoryDto);
  }

  async remove(id: number): Promise<void> {
    const category = await this.unitOfWork.categories.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const hasProducts = await this.unitOfWork.categories.hasProducts(id);
    if (hasProducts) {
      throw new BadRequestException(
        'Cannot delete category with existing products',
      );
    }

    await this.unitOfWork.categories.delete(id);
  }
}
