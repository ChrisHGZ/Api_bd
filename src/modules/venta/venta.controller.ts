import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { VentaService } from './venta.service';
import { CreateVentaDto } from './dtos/create-venta.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { User } from '../auth/entity/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('venta')
export class VentaController {
  constructor(private readonly _ventaService: VentaService) {}

  @Get()
  @Auth()
  findAll(@GetUser() user: User) {
    return this._ventaService.findAll(user);
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this._ventaService.findOne(id, user);
  }

  @Post()
  @Auth()
  create(@Body() createVentaDto: CreateVentaDto, @GetUser() user: User) {
    return this._ventaService.create(createVentaDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this._ventaService.remove(id, user);
  }
}
