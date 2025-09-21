import { PartialType } from '@nestjs/swagger';
import { CreateProductWithImageDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductWithImageDto) {}
