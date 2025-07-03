import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Venta } from './entity/venta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VentaProducto } from './entity/venta-producto.entity';
import { Product } from '../product/entity';
import { CreateVentaDto } from './dtos/create-venta.dto';
import { status } from '../shared/status-entity.enum';
import { User } from '../auth/entity/user.entity';

@Injectable()
export class VentaService {
  constructor(
    @InjectRepository(Venta)
    private readonly _ventaRepository: Repository<Venta>,
    @InjectRepository(VentaProducto)
    private readonly _ventaProductoRepository: Repository<VentaProducto>,
    @InjectRepository(Product)
    private readonly _productRepository: Repository<Product>,
  ) {}

  public async create(createVentaDto: CreateVentaDto, user: User) {
    try {
      const { fecha, nro_boleta, ventaProductos } = createVentaDto;

      if (await this.existeBoleta(nro_boleta)) {
        throw new BadRequestException(`Boleta ${nro_boleta} ya existe`);
      }

      let subMonto: number = 0;
      const productosCreados = [];

      const venta = this._ventaRepository.create({
        fecha,
        nro_boleta,
        user,
        subMonto: 0,
        iva: 0,
        montoTotal: 0,
      });

      await this._ventaRepository.save(venta);

      for (const vp of ventaProductos) {
        const producto = await this._productRepository.findOneByOrFail({
          id: vp.productoId,
        });

        const precioUnitario = producto.precio;
        const montoTotalProducto = precioUnitario * vp.cantidad;
        subMonto += montoTotalProducto;

        const ventaProducto = this._ventaProductoRepository.create({
          venta,
          producto,
          cantidad: vp.cantidad,
          precioUnitario,
          montoTotal: montoTotalProducto,
        });

        await this._ventaProductoRepository.save(ventaProducto);

        producto.stock -= vp.cantidad;
        await this._productRepository.save(producto);

        productosCreados.push({
          productId: producto.id,
          codigo: producto.codigo,
          nombre: producto.nombre,
          cantidad: vp.cantidad,
          precioUnitario,
          montoTotal: montoTotalProducto,
        });
      }

      const iva = subMonto * 0.19;
      const montoTotal = subMonto + iva;

      venta.subMonto = subMonto;
      venta.iva = iva;
      venta.montoTotal = montoTotal;

      await this._ventaRepository.save(venta);

      return {
        id: venta.id,
        fecha: venta.fecha,
        nro_boleta: venta.nro_boleta,
        subMonto: venta.subMonto,
        iva: venta.iva,
        montoTotal: venta.montoTotal,
        productos: productosCreados,
        user: user,
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  public async findAll(user: User) {
    const queryBuilder = this._ventaRepository.createQueryBuilder('venta');

    const venta = await queryBuilder
      .leftJoinAndSelect('venta.VentaProductos', 'ventaProductos')
      .leftJoinAndSelect('ventaProductos.producto', 'producto')
      .leftJoinAndSelect('producto.images', 'images')
      .leftJoinAndSelect('venta.user', 'user')
      .where('venta.status = :status', { status: status.ACTIVE })
      .andWhere('user.id = :userId', { userId: user.id })
      .getMany();

    if (!venta) throw new BadRequestException('No se encontraron ventas');

    return venta;
  }

  public async findOne(id: string, user: User) {
    const queryBuilder = this._ventaRepository.createQueryBuilder('venta');

    const venta = await queryBuilder
      .leftJoinAndSelect('venta.VentaProductos', 'ventaProductos')
      .leftJoinAndSelect('ventaProductos.producto', 'producto')
      .leftJoinAndSelect('producto.images', 'images')
      .leftJoinAndSelect('venta.user', 'user')
      .where('venta.id = :id', { id })
      .andWhere('user.id = :userId', { userId: user.id })
      .andWhere('venta.status = :status', { status: status.ACTIVE })
      .getOne();

    if (!venta) throw new BadRequestException('Venta no encontrada');

    return venta;
  }

  public async remove(id: string, user: User) {
    const venta = await this.findOne(id, user);

    if (!venta) throw new BadRequestException('Venta no encontrada');

    try {
      venta.status = status.INACTIVE;
      await this._ventaRepository.save(venta);

      for (const vp of venta.VentaProductos) {
        vp.producto.stock += vp.cantidad;
        await this._productRepository.save(vp.producto);

        vp.status = status.INACTIVE;
        await this._ventaProductoRepository.save(vp);
      }

      return { message: 'Venta Anulada' };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  private existeBoleta(nro_boleta: number) {
    return this._ventaRepository.existsBy({
      nro_boleta: nro_boleta,
      status: status.ACTIVE,
    });
  }

  private handleDBErrors(error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(error.sqlMessage);
    }
    throw new InternalServerErrorException(
      `${error.message} - Check server logs`,
    );
  }
}
