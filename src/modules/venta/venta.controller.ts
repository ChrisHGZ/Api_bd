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

@Controller('venta')
export class VentaController {
  constructor(private readonly _ventaService: VentaService) {}

  @Get()
  findAll() {
    return this._ventaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this._ventaService.findOne(id);
  }

  @Post()
  create(@Body() createVentaDto: CreateVentaDto) {
    return this._ventaService.create(createVentaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this._ventaService.remove(id);
  }
}
