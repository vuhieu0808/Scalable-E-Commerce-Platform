import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateShoppingCartDto {
  @IsMongoId({ message: 'User ID must be a valid MongoDB ID' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId!: string;
}
