import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [ProductModule, FilesModule],
})
export class ModulesModule {}
