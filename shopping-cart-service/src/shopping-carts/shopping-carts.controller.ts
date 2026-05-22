import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ShoppingCartsService } from './shopping-carts.service';
import { CreateShoppingCartDto } from './dto/create-shopping-cart.dto';
import { AddNewShoppingCartDto } from './dto/add-new-shopping-cart.dto';
import { UpdateShoppingCartDto } from './dto/update-shopping-cart.dto';

@Controller('api/shopping-carts')
export class ShoppingCartsController {
  constructor(private readonly shoppingCartsService: ShoppingCartsService) {}

  @Get('health')
  health() {
    return { status: 'OK' };
  }

  @Post()
  createShoppingCart(@Body() createShoppingCartDto: CreateShoppingCartDto) {
    return this.shoppingCartsService.createShoppingCart(createShoppingCartDto);
  }

  @Post('items')
  addNewShoppingCart(@Body() addNewShoppingCartDto: AddNewShoppingCartDto) {
    return this.shoppingCartsService.addNewShoppingCart(addNewShoppingCartDto);
  }

  @Get('user/:userId')
  findShoppingCartByUserId(@Param('userId') userId: string) {
    return this.shoppingCartsService.findShoppingCartByUserId(userId);
  }

  @Put('user/:userId')
  updateShoppingCart(
    @Param('userId') userId: string,
    @Body() updateShoppingCartDto: UpdateShoppingCartDto,
  ) {
    return this.shoppingCartsService.updateShoppingCartByUserId(
      userId,
      updateShoppingCartDto,
    );
  }

  @Delete('user/:userId')
  removeShoppingCart(@Param('userId') userId: string) {
    return this.shoppingCartsService.removeShoppingCartByUserId(userId);
  }
}
