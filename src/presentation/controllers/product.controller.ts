import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateProductDto } from '@application/dtos/product/create-product.dto';
import { UpdateProductDto } from '@application/dtos/product/update-product.dto';
import { ProductFilterDto } from '@application/dtos/product/product-filter.dto';
import { ProductResponseDto } from '@application/dtos/product/product-response.dto';
import { PaginationResponseDto } from '@application/dtos/pagination.dto';

import { ProductService } from '@application/services/product.service';

@ApiTags('Products')
@Controller('products')
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto | null> {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filters' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: PaginationResponseDto<ProductResponseDto>,
  })
  async findAll(
    @Query() filter: ProductFilterDto,
  ): Promise<PaginationResponseDto<ProductResponseDto>> {
    return this.productService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductResponseDto> {
    return this.productService.findOne(id);
  }
}
