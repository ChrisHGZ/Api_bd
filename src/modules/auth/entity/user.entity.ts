import { Product } from 'src/modules/product/entity';
import { StandardEntity } from 'src/modules/standard.entity';
import { Venta } from 'src/modules/venta/entity/venta.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class User extends StandardEntity {
  @Column('varchar', { nullable: false })
  fullName: string;

  @Column('varchar', { nullable: false })
  password: string;

  @Column('varchar', { nullable: false, unique: true })
  email: string;

  @Column('varchar', { nullable: false, default: 'USER' })
  roles: string[];

  @OneToMany(() => Product, (product) => product.user, { nullable: false })
  products: Product[];

  @OneToMany(() => Venta, (venta) => venta.user, { nullable: false })
  ventas: Venta[];
}
