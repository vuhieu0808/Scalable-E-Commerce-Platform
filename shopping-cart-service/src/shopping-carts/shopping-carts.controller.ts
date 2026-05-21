import { Controller, Get, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ShoppingCartsService } from './shopping-carts.service';
import { CreateShoppingCartDto } from './dto/create-shopping-cart.dto';
import { UpdateShoppingCartDto } from './dto/update-shopping-cart.dto';

@Controller('api/shopping-carts')
export class ShoppingCartsController {
  constructor(private readonly shoppingCartsService: ShoppingCartsService) {}

  @Get('health')
  health() {
    return { status: 'OK' };
  }

  @MessagePattern('createShoppingCart')
  create(@Payload() createShoppingCartDto: CreateShoppingCartDto) {
    return this.shoppingCartsService.createItem(createShoppingCartDto);
  }

  @MessagePattern('findByUserIdShoppingCart')
  findByUserId(@Payload() userId: string) {
    return this.shoppingCartsService.findByUserId(userId);
  }

  @MessagePattern('updateShoppingCart')
  update(@Payload() updateShoppingCartDto: UpdateShoppingCartDto) {
    return this.shoppingCartsService.updateQuantity(
      updateShoppingCartDto._id,
      updateShoppingCartDto,
    );
  }

  @MessagePattern('removeShoppingCart')
  remove(@Payload() id: string) {
    return this.shoppingCartsService.removeItem(id);
  }
}
