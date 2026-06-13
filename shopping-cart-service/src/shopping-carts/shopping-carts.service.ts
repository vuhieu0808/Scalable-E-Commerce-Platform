import { Injectable } from '@nestjs/common';
import { CreateShoppingCartDto } from './dto/create-shopping-cart.dto';
import { AddNewShoppingCartDto } from './dto/add-new-shopping-cart.dto';
import { UpdateShoppingCartDto } from './dto/update-shopping-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShoppingCart } from './entities/shopping-cart.entity';
import { ShoppingCartItem } from './entities/shopping-cart-item.entity';

@Injectable()
export class ShoppingCartsService {
  constructor(
    @InjectRepository(ShoppingCart)
    private readonly shoppingCartRepository: Repository<ShoppingCart>,
    @InjectRepository(ShoppingCartItem)
    private readonly shoppingCartItemRepository: Repository<ShoppingCartItem>,
  ) {}

  private async findShoppingCartWithItemsByUserId(
    userId: string,
  ): Promise<ShoppingCart | null> {
    return this.shoppingCartRepository.findOne({
      where: { userId },
      relations: { items: true },
    });
  }

  async createShoppingCart(
    createShoppingCartDto: CreateShoppingCartDto,
  ): Promise<ShoppingCart | null> {
    const existingShoppingCart = await this.findShoppingCartWithItemsByUserId(
      createShoppingCartDto.userId,
    );

    if (existingShoppingCart) {
      return existingShoppingCart;
    }

    const createdShoppingCart = await this.shoppingCartRepository.save(
      this.shoppingCartRepository.create({
        userId: createShoppingCartDto.userId,
        items: [],
      }),
    );

    return this.findShoppingCartWithItemsByUserId(createdShoppingCart.userId);
  }

  async addNewShoppingCart(
    addNewShoppingCartDto: AddNewShoppingCartDto,
  ): Promise<ShoppingCart | null> {
    const existingShoppingCart = await this.findShoppingCartWithItemsByUserId(
      addNewShoppingCartDto.userId,
    );

    if (!existingShoppingCart) {
      const createdShoppingCart = await this.shoppingCartRepository.save(
        this.shoppingCartRepository.create({
          userId: addNewShoppingCartDto.userId,
          items: [],
        }),
      );

      await this.shoppingCartItemRepository.save(
        this.shoppingCartItemRepository.create({
          productId: addNewShoppingCartDto.item.productId,
          quantity: addNewShoppingCartDto.item.quantity,
          shoppingCartId: createdShoppingCart.id,
        }),
      );

      return this.findShoppingCartWithItemsByUserId(createdShoppingCart.userId);
    }

    const existingItem = existingShoppingCart.items?.find(
      (item) => item.productId === addNewShoppingCartDto.item.productId,
    );

    if (existingItem) {
      existingItem.quantity += addNewShoppingCartDto.item.quantity;
      await this.shoppingCartItemRepository.save(existingItem);
    } else {
      await this.shoppingCartItemRepository.save(
        this.shoppingCartItemRepository.create({
          productId: addNewShoppingCartDto.item.productId,
          quantity: addNewShoppingCartDto.item.quantity,
          shoppingCartId: existingShoppingCart.id,
        }),
      );
    }

    return this.findShoppingCartWithItemsByUserId(existingShoppingCart.userId);
  }

  async findShoppingCartByUserId(userId: string): Promise<ShoppingCart | null> {
    return this.findShoppingCartWithItemsByUserId(userId);
  }

  async updateShoppingCartByUserId(
    userId: string,
    updateShoppingCartDto: UpdateShoppingCartDto,
  ): Promise<ShoppingCart | null> {
    const shoppingCart = await this.findShoppingCartWithItemsByUserId(userId);

    if (!shoppingCart) {
      return null;
    }

    await this.shoppingCartItemRepository.delete({
      shoppingCartId: shoppingCart.id,
    });

    await this.shoppingCartItemRepository.save(
      updateShoppingCartDto.items.map((item) =>
        this.shoppingCartItemRepository.create({
          productId: item.productId,
          quantity: item.quantity,
          shoppingCartId: shoppingCart.id,
        }),
      ),
    );

    return this.findShoppingCartWithItemsByUserId(userId);
  }

  async removeShoppingCartByUserId(
    userId: string,
  ): Promise<ShoppingCart | null> {
    const shoppingCart = await this.findShoppingCartWithItemsByUserId(userId);

    if (!shoppingCart) {
      return null;
    }

    await this.shoppingCartItemRepository.delete({
      shoppingCartId: shoppingCart.id,
    });

    await this.shoppingCartRepository.remove(shoppingCart);

    return shoppingCart;
  }
}
