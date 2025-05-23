import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
