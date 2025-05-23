import { Column, Entity, ManyToOne } from 'typeorm';
import { StandardEntity } from '../../standard.entity';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage extends StandardEntity {
  @Column('varchar', { nullable: true })
  url: string;

  @ManyToOne(() => Product, (product) => product.images)
  product: Product;
}
