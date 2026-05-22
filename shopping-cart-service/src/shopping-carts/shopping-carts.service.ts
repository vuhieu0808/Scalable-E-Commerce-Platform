import { Injectable } from '@nestjs/common';
import { CreateShoppingCartDto } from './dto/create-shopping-cart.dto';
import { AddNewShoppingCartDto } from './dto/add-new-shopping-cart.dto';
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

  async createShoppingCart(createShoppingCartDto: CreateShoppingCartDto) {
    const existingShoppingCart = await this.shoppingCartModel.findOne({
      userId: createShoppingCartDto.userId,
    });

    if (existingShoppingCart) {
      return existingShoppingCart;
    }

    const createdShoppingCart = await new this.shoppingCartModel({
      userId: createShoppingCartDto.userId,
      items: [],
    }).save();

    return createdShoppingCart;
  }

  async addNewShoppingCart(addNewShoppingCartDto: AddNewShoppingCartDto) {
    const existingShoppingCart = await this.shoppingCartModel.findOne({
      userId: addNewShoppingCartDto.userId,
    });

    if (!existingShoppingCart) {
      const createdShoppingCart = await new this.shoppingCartModel({
        userId: addNewShoppingCartDto.userId,
        items: [addNewShoppingCartDto.item],
      }).save();

      return createdShoppingCart;
    }

    const existingItem = existingShoppingCart.items.find(
      (item) =>
        item.productId.toString() === addNewShoppingCartDto.item.productId,
    );

    if (existingItem) {
      existingItem.quantity += addNewShoppingCartDto.item.quantity;
    } else {
      existingShoppingCart.items.push(addNewShoppingCartDto.item as never);
    }

    const updatedShoppingCart = await existingShoppingCart.save();

    return updatedShoppingCart;
  }

  async findShoppingCartByUserId(userId: string) {
    const shoppingCart = await this.shoppingCartModel.findOne({
      userId: userId,
    });

    return shoppingCart;
  }

  async updateShoppingCartByUserId(
    userId: string,
    updateShoppingCartDto: UpdateShoppingCartDto,
  ) {
    const updatedShoppingCart = await this.shoppingCartModel.findOneAndUpdate(
      { userId: userId },
      { items: updateShoppingCartDto.items },
      { new: true },
    );

    return updatedShoppingCart;
  }

  async removeShoppingCartByUserId(userId: string) {
    const deletedShoppingCart = await this.shoppingCartModel.findOneAndDelete({
      userId: userId,
    });

    return deletedShoppingCart;
  }
}
