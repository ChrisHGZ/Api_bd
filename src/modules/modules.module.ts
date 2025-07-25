import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { FilesModule } from './files/files.module';
import { VentaModule } from './venta/venta.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ProductModule, FilesModule, VentaModule, AuthModule],
})
export class ModulesModule {}
