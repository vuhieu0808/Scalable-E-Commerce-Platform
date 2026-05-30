import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductCatalogService } from './product-catalog.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('api/product-catalog')
export class ProductCatalogController {
  constructor(private readonly productCatalogService: ProductCatalogService) {}

  @Get('health')
  health() {
    const healthResponse = { status: 'OK' };
    return healthResponse;
  }

  @Post('products')
  createProduct(@Body() createProductDto: CreateProductDto) {
    const createdProduct =
      this.productCatalogService.createProduct(createProductDto);
    return createdProduct;
  }

  @Get('products')
  findProducts() {
    const products = this.productCatalogService.findProducts();
    return products;
  }

  @Get('products/:id')
  findProductById(@Param('id') id: string) {
    const product = this.productCatalogService.findProductById(id);
    return product;
  }

  @Patch('products/:id')
  updateProductById(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const updatedProduct = this.productCatalogService.updateProductById(
      id,
      updateProductDto,
    );
    return updatedProduct;
  }

  @Delete('products/:id')
  deleteProductById(@Param('id') id: string) {
    const deletedProduct = this.productCatalogService.deleteProductById(id);
    return deletedProduct;
  }

  @Post('categories')
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    const createdCategory =
      this.productCatalogService.createCategory(createCategoryDto);
    return createdCategory;
  }

  @Get('categories')
  findCategories() {
    const categories = this.productCatalogService.findCategories();
    return categories;
  }

  @Get('categories/:id')
  findCategoryById(@Param('id') id: string) {
    const category = this.productCatalogService.findCategoryById(id);
    return category;
  }

  @Patch('categories/:id')
  updateCategoryById(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const updatedCategory = this.productCatalogService.updateCategoryById(
      id,
      updateCategoryDto,
    );
    return updatedCategory;
  }

  @Delete('categories/:id')
  deleteCategoryById(@Param('id') id: string) {
    const deletedCategory = this.productCatalogService.deleteCategoryById(id);
    return deletedCategory;
  }
}
