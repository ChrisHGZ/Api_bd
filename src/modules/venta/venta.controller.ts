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

@Controller('venta')
export class VentaController {
  constructor(private readonly _ventaService: VentaService) {}

  @Get()
  @Auth()
  findAll() {
    return this._ventaService.findAll();
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this._ventaService.findOne(id);
  }

  @Post()
  @Auth()
  create(@Body() createVentaDto: CreateVentaDto) {
    return this._ventaService.create(createVentaDto);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this._ventaService.remove(id);
  }
}
