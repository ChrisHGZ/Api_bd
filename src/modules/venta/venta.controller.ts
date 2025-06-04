import { Body, Controller, Post } from '@nestjs/common';
import { VentaService } from './venta.service';
import { CreateVentaDto } from './dtos/create-venta.dto';

@Controller('venta')
export class VentaController {
  constructor(private readonly _ventaService: VentaService) {}

  @Post()
  create(@Body() createVentaDto: CreateVentaDto) {
    return this._ventaService.create(createVentaDto);
  }
}
