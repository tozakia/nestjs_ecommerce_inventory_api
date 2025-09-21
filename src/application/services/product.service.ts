import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Product } from '@domain/entities/product.entity';
import {
  PaginationOptions,
  PaginationResult,
  ProductFilter,
} from '@domain/value-objects/pagination.vo';
import { UnitOfWork } from '@infrastructure/database/unit-of-work';

import type { IUnitOfWork } from '@application/interfaces/unit-of-work.interface';
import type { IStorageService } from '@application/interfaces/storage.service.interface';

import { CreateProductDto } from '@application/dtos/product/create-product.dto';
import { UpdateProductDto } from '@application/dtos/product/update-product.dto';
import { ProductFilterDto } from '@application/dtos/product/product-filter.dto';
import { PaginationFilterDto } from '@application/dtos/pagination/pagination-filter.dto';

@Injectable()
export class ProductService {
  constructor(
    @Inject(UnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    image?: Express.Multer.File,
  ): Promise<Product | null> {
    // Verify category exists
    const category = await this.unitOfWork.categories.findById(
      createProductDto.categoryId,
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    let imageUrl: string | undefined;
    if (image) {
      imageUrl = await this.storageService.uploadFile(image, 'products');
    }

    const product = await this.unitOfWork.products.create({
      ...createProductDto,
      imageUrl,
    });

    return await this.unitOfWork.products.findById(product.id);
  }

  async findAll(filter: ProductFilterDto): Promise<PaginationResult<Product>> {
    return await this.unitOfWork.products.findWithFilters(
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

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    image?: Express.Multer.File,
  ): Promise<Product | null> {
    const product = await this.unitOfWork.products.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.categoryId) {
      const category = await this.unitOfWork.categories.findById(
        updateProductDto.categoryId,
      );
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    let imageUrl = product.imageUrl;
    if (image) {
      // Delete old image if exists
      if (product.imageUrl) {
        await this.storageService.deleteFile(product.imageUrl);
      }
      imageUrl = await this.storageService.uploadFile(image, 'products');
    }

    return await this.unitOfWork.products.update(id, {
      ...updateProductDto,
      imageUrl,
    });
  }

  async remove(id: number): Promise<void> {
    const product = await this.unitOfWork.products.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.imageUrl) {
      await this.storageService.deleteFile(product.imageUrl);
    }

    await this.unitOfWork.products.delete(id);
  }

  async search(
    keyword: string,
    pagination: PaginationFilterDto,
  ): Promise<PaginationResult<Product>> {
    if (!keyword || keyword.trim().length < 2) {
      throw new BadRequestException(
        'Search keyword must be at least 2 characters',
      );
    }
    return await this.unitOfWork.products.searchProducts(keyword, {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
    });
  }

  async findProductsWithFilters(
    filters: ProductFilter,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<Product>> {
    return await this.unitOfWork.products.findWithFilters(filters, pagination);
  }
}
