import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class ShoppingCartItemDto {
  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Product ID is required' })
  productId!: string;

  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be greater than 0' })
  @IsNotEmpty({ message: 'Quantity is required' })
  @Type(() => Number)
  quantity!: number;
}

export class AddNewShoppingCartDto {
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId!: string;

  @IsNotEmpty({ message: 'Item is required' })
  @ValidateNested()
  @Type(() => ShoppingCartItemDto)
  item!: ShoppingCartItemDto;
}
