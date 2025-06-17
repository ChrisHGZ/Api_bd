import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { ProductService } from './product.service';
import { UpdateProductDto } from './dtos/update-product.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('product')
export class ProductController {
  constructor(private readonly _productService: ProductService) {}

  @Post()
  @Auth()
  create(@Body() createProductDto: CreateProductDto) {
    return this._productService.create(createProductDto);
  }
  
  @Get()
  @Auth()
  findAll() {
    return this._productService.findAll();
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string) {
    return this._productService.findOnePlain(term);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this._productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this._productService.delete(id);
  }
}
