import { Product } from 'src/modules/product/entity';
import { StandardEntity } from 'src/modules/standard.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Venta } from './venta.entity';

@Entity()
export class VentaProducto extends StandardEntity {
  @ManyToOne(() => Product, { nullable: false })
  producto: Product;

  @ManyToOne(() => Venta, { nullable: false })
  venta: Venta;

  @Column('integer', { nullable: false })
  cantidad: number;

  @Column('integer', { nullable: false })
  precioUnitario: number;

  @Column('integer', { nullable: false })
  montoTotal: number;
}
