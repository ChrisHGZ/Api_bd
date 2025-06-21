import { StandardEntity } from '../../standard.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from 'src/modules/auth/entity/user.entity';

@Entity('products')
export class Product extends StandardEntity {
  @Column('varchar', { nullable: false, unique: true })
  codigo: string;

  @Column('varchar', { nullable: false, unique: true })
  nombre: string;

  @Column('varchar', { nullable: true })
  descripcion?: string;

  @Column('integer', { nullable: false })
  precio: number;

  @Column('integer', { nullable: false })
  stock: number;

  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    nullable: true,
    cascade: true,
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.products, { nullable: false })
  user: User;
}
