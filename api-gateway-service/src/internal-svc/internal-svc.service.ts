import {
  BadGatewayException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import {
  AddShoppingCartItemRequestDto,
  CreateShoppingCartRequestDto,
  UpdateShoppingCartRequestDto,
} from './dto/request/shopping-cart.request.dto';
import {
  SignInRequestDto,
  SignUpRequestDto,
  UpdateUserRequestDto,
} from './dto/request/user.request.dto';
import { SendNotificationRequestDto } from './dto/request/notification.request.dto';
import { HealthCheckResponseDto } from './dto/response/health-check.response.dto';
import { UserResponseDto } from './dto/response/user.response.dto';

type InternalRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
};

type InternalHttpResponse = {
  status: number;
  statusText: string;
  data: string;
};

@Injectable()
export class InternalSVCService {
  constructor(
    private readonly httpService: HttpService,
    @Inject('NOTIFICATION_QUEUE_CLIENT')
    private readonly notificationQueueClient: ClientProxy,
  ) {}

  private readonly internalBaseUrl =
    process.env.NGINX_PRIVATE_HTTP_URL ?? 'http://nginx-private:8080';

  private parseResponseBody(responseBody: string): unknown {
    const trimmedBody = responseBody.trim();

    if (!trimmedBody) {
      return undefined;
    }

    try {
      return JSON.parse(responseBody) as unknown;
    } catch {
      return responseBody;
    }
  }

  private formatRequestPath(requestUrl: URL): string {
    return requestUrl.pathname.replace(/^\/api\//, '').replace(/^\//, '');
  }

  private async request<TResponse>(
    path: string,
    options: InternalRequestOptions = {},
  ): Promise<TResponse> {
    const baseUrl = this.internalBaseUrl.endsWith('/')
      ? this.internalBaseUrl
      : `${this.internalBaseUrl}/`;
    const requestUrl = new URL(path.replace(/^\//, ''), baseUrl);
    const response = (await firstValueFrom(
      this.httpService.request<string>({
        method: options.method ?? 'GET',
        url: requestUrl.toString(),
        data: options.body,
        responseType: 'text',
        validateStatus: () => true,
      }),
    )) as InternalHttpResponse;

    const responseBody = this.parseResponseBody(response.data);

    if (response.status < 200 || response.status >= 300) {
      throw new HttpException(
        responseBody ?? response.statusText,
        response.status,
      );
    }

    if (responseBody === undefined) {
      throw new BadGatewayException(
        `Internal service returned an empty response for ${this.formatRequestPath(requestUrl)}`,
      );
    }

    return responseBody as TResponse;
  }

  async checkHealthForShoppingCart(): Promise<HealthCheckResponseDto> {
    return this.request<HealthCheckResponseDto>('/api/shopping-carts/health', {
      method: 'GET',
    });
  }

  async checkHealthForUser(): Promise<HealthCheckResponseDto> {
    return this.request<HealthCheckResponseDto>('/api/users/health', {
      method: 'GET',
    });
  }

  signUpUser(signUpRequestDto: SignUpRequestDto): Promise<UserResponseDto> {
    return this.request<UserResponseDto>('/api/users/sign-up', {
      method: 'POST',
      body: signUpRequestDto,
    });
  }

  signInUser(signInRequestDto: SignInRequestDto) {
    return this.request('/api/users/sign-in', {
      method: 'POST',
      body: signInRequestDto,
    });
  }

  findUserById(id: string) {
    return this.request(`/api/users/${id}`, {
      method: 'GET',
    });
  }

  updateUserById(id: string, updateUserRequestDto: UpdateUserRequestDto) {
    return this.request(`/api/users/${id}`, {
      method: 'PATCH',
      body: updateUserRequestDto,
    });
  }

  deleteUserById(id: string) {
    return this.request(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  createShoppingCart(
    createShoppingCartRequestDto: CreateShoppingCartRequestDto,
  ) {
    return this.request('/api/shopping-carts', {
      method: 'POST',
      body: createShoppingCartRequestDto,
    });
  }

  findShoppingCartByUserId(userId: string) {
    return this.request(`/api/shopping-carts/user/${userId}`, {
      method: 'GET',
    });
  }

  addShoppingCartItem(
    addShoppingCartItemRequestDto: AddShoppingCartItemRequestDto,
  ) {
    return this.request('/api/shopping-carts/items', {
      method: 'POST',
      body: addShoppingCartItemRequestDto,
    });
  }

  updateShoppingCartByUserId(
    userId: string,
    updateShoppingCartRequestDto: UpdateShoppingCartRequestDto,
  ) {
    return this.request(`/api/shopping-carts/user/${userId}`, {
      method: 'PUT',
      body: updateShoppingCartRequestDto,
    });
  }

  removeShoppingCartByUserId(userId: string) {
    return this.request(`/api/shopping-carts/user/${userId}`, {
      method: 'DELETE',
    });
  }

  async sendNotification(payload: SendNotificationRequestDto): Promise<void> {
    await firstValueFrom(
      this.notificationQueueClient.emit('send_notification', {
        messageId: randomUUID(),
        ...payload,
      }),
    );
  }

  async checkHealthForNotification(): Promise<HealthCheckResponseDto> {
    return this.request<HealthCheckResponseDto>('/api/notifications/health', {
      method: 'GET',
    });
  }
}
