import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCatalogService } from './product-catalog.service';
import { ProductCatalogController } from './product-catalog.controller';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category])],
  controllers: [ProductCatalogController],
  providers: [ProductCatalogService],
})
export class ProductCatalogModule {}
