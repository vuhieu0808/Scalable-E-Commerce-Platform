import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';

export class ShoppingCartItemDto {
  @IsMongoId({ message: 'Product ID must be a valid MongoDB ID' })
  @IsNotEmpty({ message: 'Product ID is required' })
  productId!: string;

  @IsNotEmpty({ message: 'Quantity is required' })
  @Type(() => Number)
  quantity!: number;
}

export class CreateShoppingCartRequestDto {
  @IsMongoId({ message: 'User ID must be a valid MongoDB ID' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId!: string;
}

export class AddShoppingCartItemRequestDto {
  @IsMongoId({ message: 'User ID must be a valid MongoDB ID' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId!: string;

  @IsNotEmpty({ message: 'Item is required' })
  @Type(() => ShoppingCartItemDto)
  item!: ShoppingCartItemDto;
}

export class UpdateShoppingCartRequestDto {
  @IsArray({ message: 'Items must be an array' })
  @IsNotEmpty({ message: 'Items are required' })
  @ValidateNested({ each: true })
  @Type(() => ShoppingCartItemDto)
  items!: ShoppingCartItemDto[];
}