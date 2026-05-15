import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ShoppingCartsService } from './shopping-carts.service';
import { CreateShoppingCartDto } from './dto/create-shopping-cart.dto';
import { UpdateShoppingCartDto } from './dto/update-shopping-cart.dto';

@Controller()
export class ShoppingCartsController {
  constructor(private readonly shoppingCartsService: ShoppingCartsService) {}

  @MessagePattern('createShoppingCart')
  create(@Payload() createShoppingCartDto: CreateShoppingCartDto) {
    return this.shoppingCartsService.create(createShoppingCartDto);
  }

  @MessagePattern('findAllShoppingCarts')
  findAll() {
    return this.shoppingCartsService.findAll();
  }

  @MessagePattern('findOneShoppingCart')
  findOne(@Payload() id: number) {
    return this.shoppingCartsService.findOne(id);
  }

  @MessagePattern('updateShoppingCart')
  update(@Payload() updateShoppingCartDto: UpdateShoppingCartDto) {
  }

  @MessagePattern('removeShoppingCart')
  remove(@Payload() id: number) {
    return this.shoppingCartsService.remove(id);
  }
}
