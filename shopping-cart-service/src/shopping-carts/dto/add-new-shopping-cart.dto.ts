import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ShoppingCartItemDto {
  @IsMongoId({ message: 'Product ID must be a valid MongoDB ID' })
  @IsNotEmpty({ message: 'Product ID is required' })
  productId!: string;

  @IsNotEmpty({ message: 'Quantity is required' })
  @Type(() => Number)
  quantity!: number;
}

export class AddNewShoppingCartDto {
  @IsMongoId({ message: 'User ID must be a valid MongoDB ID' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId!: string;

  @IsNotEmpty({ message: 'Item is required' })
  @Type(() => ShoppingCartItemDto)
  item!: ShoppingCartItemDto;
}
