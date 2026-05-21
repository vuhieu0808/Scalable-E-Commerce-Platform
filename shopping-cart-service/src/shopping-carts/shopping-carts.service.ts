import { Injectable } from '@nestjs/common';
import { CreateShoppingCartDto } from './dto/create-shopping-cart.dto';
import { UpdateShoppingCartDto } from './dto/update-shopping-cart.dto';
import { ShoppingCart } from './schemas/shopping-cart.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ShoppingCartsService {
  constructor(
    @InjectModel(ShoppingCart.name)
    private readonly shoppingCartModel: Model<ShoppingCart>,
  ) {}

  async createItem(createShoppingCartDto: CreateShoppingCartDto) {
    return await new this.shoppingCartModel(createShoppingCartDto).save();
  }

  async findByUserId(userId: string) {
    return await this.shoppingCartModel.find({ userId: userId });
  }

  async updateQuantity(id: string, updateShoppingCartDto: UpdateShoppingCartDto) {
    return await this.shoppingCartModel.findByIdAndUpdate(
      { _id: id },
      updateShoppingCartDto,
      { new: true },
    );
  }

  async removeItem(id: string) {
    return await this.shoppingCartModel.findByIdAndDelete(id);
  }
}
