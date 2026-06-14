import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Param,
} from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import {
  AddShoppingCartItemRequestDto,
  CreateShoppingCartRequestDto,
  UpdateShoppingCartRequestDto,
} from '../internal-svc/dto/request/shopping-cart.request.dto';
import {
  SignInRequestDto,
  SignUpRequestDto,
  UpdateUserRequestDto,
} from '../internal-svc/dto/request/user.request.dto';
import { UserResponseDto } from '../internal-svc/dto/response/user.response.dto';

@Controller('api-gateway')
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  // User Endpoints

  @Post('users/sign-up')
  async signUp(@Body() signUpRequestDto: SignUpRequestDto) {
    console.log('Received sign-up request:', signUpRequestDto);
    const user: UserResponseDto = await this.apiGatewayService.signUpUser(signUpRequestDto);
    console.log('User created successfully:', user);

    await this.apiGatewayService.createShoppingCart({
      userId: user.id,
    });
    
    await this.apiGatewayService.sendNotification({
      channel: 'email',
      // recipient: user.email,
      recipient: "minhhieuvutran046@gmail.com",
      type: 'welcome',
      data: { userName: user.name ?? 'Valued Customer' },
    });

    console.log('Welcome notification sent successfully to:', user);

    return user;
  }

  @Get('users/health')
  async checkHealthForUser() {
    console.log('Checking health for User Service...');
    return this.apiGatewayService.checkHealthForUser();
  }

  @Post('users/sign-in')
  signIn(@Body() signInRequestDto: SignInRequestDto) {
    return this.apiGatewayService.signInUser(signInRequestDto);
  }

  @Get('users/:id')
  findUserById(@Param('id') id: string) {
    return this.apiGatewayService.findUserById(id);
  }

  @Patch('users/:id')
  updateUserById(
    @Param('id') id: string,
    @Body() updateUserRequestDto: UpdateUserRequestDto,
  ) {
    return this.apiGatewayService.updateUserById(id, updateUserRequestDto);
  }

  @Delete('users/:id')
  deleteUserById(@Param('id') id: string) {
    return this.apiGatewayService.deleteUserById(id);
  }

  // Shopping Cart Endpoints

  @Get('shopping-carts/health')
  async checkHealthForShoppingCart() {
    return this.apiGatewayService.checkHealthForShoppingCart();
  }

  // @Post('shopping-carts')
  // createShoppingCart(
  //   @Body() createShoppingCartRequestDto: CreateShoppingCartRequestDto,
  // ) {
  //   return this.apiGatewayService.createShoppingCart(
  //     createShoppingCartRequestDto,
  //   );
  // }

  @Get('shopping-carts/user/:userId')
  findShoppingCartByUserId(@Param('userId') userId: string) {
    return this.apiGatewayService.findShoppingCartByUserId(userId);
  }

  @Post('shopping-carts/items')
  addNewShoppingCartItem(
    @Body() addShoppingCartItemRequestDto: AddShoppingCartItemRequestDto,
  ) {
    return this.apiGatewayService.addShoppingCartItem(
      addShoppingCartItemRequestDto,
    );
  }

  @Patch('shopping-carts/user/:userId')
  updateShoppingCartByUserId(
    @Param('userId') userId: string,
    @Body() updateShoppingCartRequestDto: UpdateShoppingCartRequestDto,
  ) {
    return this.apiGatewayService.updateShoppingCartByUserId(
      userId,
      updateShoppingCartRequestDto,
    );
  }

  @Delete('shopping-carts/user/:userId')
  removeShoppingCartByUserId(@Param('userId') userId: string) {
    return this.apiGatewayService.removeShoppingCartByUserId(userId);
  }
}
