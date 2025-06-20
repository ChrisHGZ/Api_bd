import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  codigo: string;

  @IsString()
  @MinLength(3)
  nombre: string;

  @IsString()
  @MinLength(3)
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsNumber()
  @IsPositive()
  stock: number;

  @IsString({ each: true })
  @IsOptional()
  @IsArray()
  images?: string[];
}
