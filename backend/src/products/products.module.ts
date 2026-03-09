import { Module } from '@nestjs/common';
import { ProductsController } from './controller/products.controller';
import { ProductsService } from './services/products.service';
import { ProductsRepository } from './repositories/products.repository';
import { PRODUCTS_REPOSITORY, PRODUCTS_SERVICE } from '../common/tokens';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [
    { provide: PRODUCTS_SERVICE, useClass: ProductsService },
    { provide: PRODUCTS_REPOSITORY, useClass: ProductsRepository },
  ],
  exports: [PRODUCTS_SERVICE],
})
export class ProductsModule {}
