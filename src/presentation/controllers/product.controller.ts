import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
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
import { PaginationFilterDto } from '@application/dtos/pagination/pagination-filter.dto';
import { PaginationResponseDto } from '@application/dtos/pagination/pagination.dto';

import { ProductService } from '@application/services/product.service';

import { JwtAuthGuard } from '@presentation/guards/jwt-auth.guard';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard)
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

  @Get('search')
  @ApiOperation({ summary: 'Search products by keyword' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: PaginationResponseDto<ProductResponseDto>,
  })
  @ApiResponse({ status: 400, description: 'Invalid search keyword' })
  async search(
    @Query('q') keyword: string,
    @Query() pagination: PaginationFilterDto,
  ): Promise<PaginationResponseDto<ProductResponseDto>> {
    return this.productService.search(keyword, pagination);
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

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product or category not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto | null> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productService.remove(id);
  }
}
