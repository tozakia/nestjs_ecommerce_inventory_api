import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Product } from '@domain/entities/product.entity';
import { PaginationResult } from '@domain/value-objects/pagination.vo';
import { UnitOfWork } from '@infrastructure/database/unit-of-work';
import type { IUnitOfWork } from '@application/interfaces/unit-of-work.interface';
import { CreateProductDto } from '@application/dtos/product/create-product.dto';
import { UpdateProductDto } from '@application/dtos/product/update-product.dto';
import { ProductFilterDto } from '@application/dtos/product/product-filter.dto';

@Injectable()
export class ProductService {
  constructor(
    @Inject(UnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product | null> {
    // Verify category exists
    const category = await this.unitOfWork.categories.findById(
      createProductDto.categoryId,
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    let imageUrl: string | undefined;

    const product = await this.unitOfWork.products.create({
      ...createProductDto,
      imageUrl,
    });

    return this.unitOfWork.products.findById(product.id);
  }

  async findAll(filter: ProductFilterDto): Promise<PaginationResult<Product>> {
    return this.unitOfWork.products.findWithFilters(
      {
        categoryId: filter.categoryId,
        minPrice: filter.minPrice,
        maxPrice: filter.maxPrice,
      },
      { page: filter.page || 1, limit: filter.limit || 10 },
    );
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.unitOfWork.products.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }
}
