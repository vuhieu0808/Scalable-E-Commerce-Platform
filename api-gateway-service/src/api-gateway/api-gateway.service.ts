import { Injectable } from '@nestjs/common';
import { InternalSVCService } from '../internal-svc/internal-svc.service';
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
import { SendNotificationRequestDto } from '../internal-svc/dto/request/notification.request.dto';

@Injectable()
export class ApiGatewayService {
  constructor(private readonly internalSVCService: InternalSVCService) {}

  async signUpUser(signUpRequestDto: SignUpRequestDto) {
    const user = await this.internalSVCService.signUpUser(signUpRequestDto);
    return user;
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

  sendNotification(sendNotificationRequestDto: SendNotificationRequestDto) {
    return this.internalSVCService.sendNotification(sendNotificationRequestDto);
  }

  async checkHealthForShoppingCart() {
    return this.internalSVCService.checkHealthForShoppingCart();
  }

  async checkHealthForUser() {
    return this.internalSVCService.checkHealthForUser();
  }
}
