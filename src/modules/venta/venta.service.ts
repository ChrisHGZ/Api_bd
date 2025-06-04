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

  public async create(createVentaDto: CreateVentaDto) {
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

        if (producto.stock < vp.cantidad) {
          throw new BadRequestException(
            `No hay stock suficiente para el producto ${producto.nombre}`,
          );
        }

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
        subMonto,
        iva,
        montoTotal,
        productos: productosCreados,
      };
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
      'Unexpected error, check server logs',
    );
  }
}
