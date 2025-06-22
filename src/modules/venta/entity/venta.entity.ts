import { StandardEntity } from 'src/modules/standard.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { VentaProducto } from './venta-producto.entity';
import { User } from 'src/modules/auth/entity/user.entity';

@Entity()
export class Venta extends StandardEntity {
  @Column('datetime', { nullable: false })
  fecha: Date;

  @Column('integer', { nullable: false, unique: true })
  nro_boleta: number;

  @Column('integer', { nullable: false })
  subMonto: number;

  @Column('integer', { nullable: false })
  iva: number;

  @Column('integer', { nullable: false })
  montoTotal: number;

  @OneToMany(() => VentaProducto, (ventaProducto) => ventaProducto.venta)
  VentaProductos: VentaProducto[];

  @ManyToOne(() => User, (user) => user.ventas, { nullable: false })
  user: User;
}
