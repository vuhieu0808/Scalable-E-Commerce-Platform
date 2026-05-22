import { Injectable } from '@nestjs/common';
import { InternalSVCService } from '../internal-svc/internal-svc.service';
import {
  AddShoppingCartItemRequestDto,
  CreateShoppingCartRequestDto,
  UpdateShoppingCartRequestDto,
} from './dto/shopping-cart.dto';
import {
  SignInRequestDto,
  SignUpRequestDto,
  UpdateUserRequestDto,
} from './dto/user.dto';

@Injectable()
export class ApiGatewayService {
  constructor(private readonly internalSVCService: InternalSVCService) {}

  signUpUser(signUpRequestDto: SignUpRequestDto) {
    return this.internalSVCService.signUpUser(signUpRequestDto);
  }

  signInUser(signInRequestDto: SignInRequestDto) {
    return this.internalSVCService.signInUser(signInRequestDto);
  }

  findUserById(id: string) {
    return this.internalSVCService.findUserById(id);
  }

  updateUserById(id: string, updateUserRequestDto: UpdateUserRequestDto) {
    return this.internalSVCService.updateUserById(id, updateUserRequestDto);
  }

  deleteUserById(id: string) {
    return this.internalSVCService.deleteUserById(id);
  }

  createShoppingCart(
    createShoppingCartRequestDto: CreateShoppingCartRequestDto,
  ) {
    return this.internalSVCService.createShoppingCart(
      createShoppingCartRequestDto,
    );
  }

  findShoppingCartByUserId(userId: string) {
    return this.internalSVCService.findShoppingCartByUserId(userId);
  }

  addShoppingCartItem(
    addShoppingCartItemRequestDto: AddShoppingCartItemRequestDto,
  ) {
    return this.internalSVCService.addShoppingCartItem(
      addShoppingCartItemRequestDto,
    );
  }

  updateShoppingCartByUserId(
    userId: string,
    updateShoppingCartRequestDto: UpdateShoppingCartRequestDto,
  ) {
    return this.internalSVCService.updateShoppingCartByUserId(
      userId,
      updateShoppingCartRequestDto,
    );
  }

  removeShoppingCartByUserId(userId: string) {
    return this.internalSVCService.removeShoppingCartByUserId(userId);
  }

  async checkHealth() {
    return this.internalSVCService.checkHealth();
  }
}
