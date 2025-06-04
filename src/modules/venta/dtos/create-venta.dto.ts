import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

class CreateVentaProductoDto {
  @IsUUID()
  @IsNotEmpty()
  productoId: string; // UUID como string

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsInt()
  @Min(0)
  precioUnitario: number;
}

export class CreateVentaDto {
  @IsDate()
  @Type(() => Date)
  fecha: Date;

  @IsInt()
  @Min(3)
  nro_boleta: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVentaProductoDto)
  ventaProductos: CreateVentaProductoDto[];
}
