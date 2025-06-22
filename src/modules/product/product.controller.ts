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
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entity/user.entity';

@Controller('product')
export class ProductController {
  constructor(private readonly _productService: ProductService) {}

  @Post()
  @Auth()
  create(@Body() createProductDto: CreateProductDto, @GetUser() user: User) {
    return this._productService.create(createProductDto, user);
  }

  @Get()
  @Auth()
  findAll(@GetUser() user: User) {
    return this._productService.findAll(user);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string, @GetUser() user: User) {
    return this._productService.findOne(term, user);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User,
  ) {
    return this._productService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this._productService.delete(id, user);
  }
}
