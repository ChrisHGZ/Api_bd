import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductImage } from './entity';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dtos/create-product.dto';
import { validate as isUUID } from 'uuid';
import { UpdateProductDto } from './dtos/update-product.dto';
import { status } from '../shared/status-entity.enum';

@Injectable()
export class ProductService {
  private readonly logger = new Logger('productService');
  constructor(
    @InjectRepository(Product)
    private readonly _productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly _productImageRepository: Repository<ProductImage>,

    private readonly _dataSource: DataSource,
  ) {}

  public async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...rest } = createProductDto;

      const product = this._productRepository.create({
        ...rest,
        images: images.map((image) =>
          this._productImageRepository.create({ url: image }),
        ),
      });

      await this._productRepository.save(product);

      return { ...product, images: images };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll() {
    const productsQueryBuilder =
      this._productRepository.createQueryBuilder('product');

    const products = await productsQueryBuilder
      .leftJoinAndSelect('product.images', 'images')
      .where('product.status = :status', { status: status.ACTIVE })
      .getMany();

    return products.map((product) => ({
      ...product,
      images: product.images.map((image) => image.url) || [],
    }));
  }

  public async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this._productRepository.findOne({
        where: { id: term, status: status.ACTIVE },

        relations: ['images'],
      });
    } else {
      const queryBuilder = this._productRepository.createQueryBuilder('prod');

      product = await queryBuilder
        .leftJoinAndSelect('prod.images', 'images')
        .where('UPPER(prod.nombre) = :nombre OR prod.codigo = :codigo', {
          nombre: term.toUpperCase(),
          codigo: term.toLowerCase(),
        })
        .andWhere('prod.status = :status', { status: status.ACTIVE })
        .getOne();
    }

    if (!product) throw new BadRequestException('Product not found');

    console.log({ product });

    return product;
  }

  public async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);

    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  public async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto;

    const productUpdate = await this._productRepository.preload({
      id,
      ...toUpdate,
    });

    if (!productUpdate) throw new BadRequestException('Product not found');

    const queryRunner = this._dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, {
          product: { id },
        });

        productUpdate.images = images.map((image) =>
          this._productImageRepository.create({ url: image }),
        );
      }

      await queryRunner.manager.save(productUpdate);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBErrors(error);
    }
  }

  public async delete(id: string) {
    const product = await this.findOne(id);

    await this._productRepository.update(product.id, {
      status: status.INACTIVE,
    });

    if (product.images.length > 0) {
      await this._productImageRepository.update(
        product.images.map((image) => image.id),
        {
          status: status.INACTIVE,
        },
      );
    }
  }

  private handleDBErrors(error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(error.sqlMessage);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
