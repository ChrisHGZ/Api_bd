import { Module } from '@nestjs/common';
import { VentaController } from './venta.controller';
import { VentaService } from './venta.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './entity/venta.entity';
import { VentaProducto } from './entity/venta-producto.entity';
import { ProductModule } from '../product/product.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [VentaController],
  providers: [VentaService],
  imports: [
    TypeOrmModule.forFeature([Venta, VentaProducto]),
    ProductModule,
    AuthModule,
  ],
  exports: [VentaService, TypeOrmModule],
})
export class VentaModule {}
