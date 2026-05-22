import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ShoppingCartItemDto } from './add-new-shopping-cart.dto';

export class UpdateShoppingCartDto {
  @IsArray({ message: 'Items must be an array' })
  @IsNotEmpty({ message: 'Items are required' })
  @ValidateNested({ each: true })
  @Type(() => ShoppingCartItemDto)
  items!: ShoppingCartItemDto[];
}
