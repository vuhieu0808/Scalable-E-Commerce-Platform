import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateShoppingCartDto, ShoppingCartItemDto } from './create-shopping-cart.dto';

export class UpdateShoppingCartDto {
  @IsMongoId({ message: 'Shopping Cart ID must be a valid MongoDB ID' })
  @IsNotEmpty({ message: 'Shopping Cart ID is required' })
  _id!: string;

  @IsMongoId({ message: 'User ID must be a valid MongoDB ID' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId!: string;

  @IsNotEmpty({ message: 'Item is required' })
  @Type(() => ShoppingCartItemDto)
  item!: ShoppingCartItemDto;
}
