import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { FilesModule } from './files/files.module';
import { VentaModule } from './venta/venta.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ProductModule, FilesModule, VentaModule, UserModule],
})
export class ModulesModule {}
