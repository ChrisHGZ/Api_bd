import { BadRequestException, Injectable } from '@nestjs/common';
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
    const { fecha, nro_boleta, ventaProductos } = createVentaDto;

    if (await this.existeBoleta(nro_boleta)) {
      throw new BadRequestException(`Boleta ${nro_boleta} ya existe`);
    }

    let subMonto = 0;

    for (const vp of ventaProductos) {
      subMonto += vp.precioUnitario * vp.cantidad;
    }

    const iva = subMonto * 0.19;
    const montoTotal = subMonto + iva;

    const venta = this._ventaRepository.create({
      fecha,
      nro_boleta,
      subMonto,
      iva,
      montoTotal,
    });

    await this._ventaRepository.save(venta);

    const productosCreados = [];
    for (const vp of ventaProductos) {
      const producto = await this._productRepository.findOneByOrFail({
        id: vp.productoId,
      });

      const ventaProducto = this._ventaProductoRepository.create({
        venta,
        producto,
        cantidad: vp.cantidad,
        precioUnitario: vp.precioUnitario,
        montoTotal: vp.precioUnitario * vp.cantidad,
      });

      await this._ventaProductoRepository.save(ventaProducto);

      producto.stock -= vp.cantidad;
      await this._productRepository.save(producto);

      productosCreados.push({
        productoId: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        cantidad: vp.cantidad,
        precioUnitario: vp.precioUnitario,
        montoTotal: vp.precioUnitario * vp.cantidad,
      });
    }

    return {
      id: venta.id,
      fecha: venta.fecha,
      nro_boleta: venta.nro_boleta,
      subMonto: venta.subMonto,
      iva: venta.iva,
      montoTotal: venta.montoTotal,
      productos: productosCreados,
    };
  }

  private existeBoleta(nro_boleta: number) {
    return this._ventaRepository.existsBy({
      nro_boleta: nro_boleta,
      status: status.ACTIVE,
    });
  }
}
