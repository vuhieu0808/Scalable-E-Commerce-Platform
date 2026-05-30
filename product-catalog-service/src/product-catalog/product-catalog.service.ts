import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';

@Injectable()
export class ProductCatalogService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create({
      name: createCategoryDto.name,
      description: createCategoryDto.description,
    });

    const createdCategory = await this.categoryRepository.save(category);
    return createdCategory;
  }

  async findCategories() {
    const categories = await this.categoryRepository.find({
      order: { name: 'ASC' },
    });
    return categories;
  }

  async findCategoryById(id: string) {
    const foundCategory = await this.categoryRepository.findOne({ where: { id } });

    if (!foundCategory) {
      throw new NotFoundException('Category not found');
    }

    return foundCategory;
  }

  async updateCategoryById(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    Object.assign(category, updateCategoryDto);
    const updatedCategory = await this.categoryRepository.save(category);
    return updatedCategory;
  }

  async deleteCategoryById(id: string) {
    const deletedCategory = await this.categoryRepository.findOne({ where: { id } });

    if (!deletedCategory) {
      throw new NotFoundException('Category not found');
    }

    await this.categoryRepository.remove(deletedCategory);
    return deletedCategory;
  }

  async createProduct(createProductDto: CreateProductDto) {
    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    const product = this.productRepository.create({
      name: createProductDto.name,
      sku: createProductDto.sku,
      description: createProductDto.description,
      price: createProductDto.price,
      stockQuantity: createProductDto.stockQuantity,
      isActive: createProductDto.isActive ?? true,
      category,
    });

    const createdProduct = await this.productRepository.save(product);
    return createdProduct;
  }

  async findProducts() {
    const products = await this.productRepository.find({
      relations: { category: true },
      order: { createdAt: 'DESC' },
    });
    return products;
  }

  async findProductById(id: string) {
    const foundProduct = await this.productRepository.findOne({
      where: { id },
      relations: { category: true },
    });

    if (!foundProduct) {
      throw new NotFoundException('Product not found');
    }

    return foundProduct;
  }

  async updateProductById(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('Category not found');
      }

      product.category = category;
    }

    Object.assign(product, {
      name: updateProductDto.name ?? product.name,
      sku: updateProductDto.sku ?? product.sku,
      description: updateProductDto.description ?? product.description,
      price: updateProductDto.price ?? product.price,
      stockQuantity: updateProductDto.stockQuantity ?? product.stockQuantity,
      isActive: updateProductDto.isActive ?? product.isActive,
    });

    const updatedProduct = await this.productRepository.save(product);
    return updatedProduct;
  }

  async deleteProductById(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.remove(product);
    const deletedProduct = product;
    return deletedProduct;
  }
}
