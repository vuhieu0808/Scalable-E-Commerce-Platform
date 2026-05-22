import { BadGatewayException, HttpException, Injectable } from '@nestjs/common';
import {
  AddShoppingCartItemRequestDto,
  CreateShoppingCartRequestDto,
  UpdateShoppingCartRequestDto,
} from '../api-gateway/dto/shopping-cart.dto';
import {
  SignInRequestDto,
  SignUpRequestDto,
  UpdateUserRequestDto,
} from '../api-gateway/dto/user.dto';

type InternalRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
};

type HealthCheckResult = {
  status: string;
};

@Injectable()
export class InternalSVCService {
  private readonly internalBaseUrl =
    process.env.NGINX_PRIVATE_HTTP_URL ?? 'http://nginx-private:8080';

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
    const response = await fetch(requestUrl, {
      method: options.method ?? 'GET',
      headers: {
        'content-type': 'application/json',
      },
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    if (!response.ok) {
      const responseText = await response.text();
      let responseBody: string | Record<string, any> = responseText;

      try {
        const parsedBody: unknown = JSON.parse(responseText);
        if (parsedBody !== null && typeof parsedBody === 'object') {
          responseBody = parsedBody as Record<string, any>;
        }
      } catch {
        // keep plain text body when the upstream response is not JSON
      }

      throw new HttpException(responseBody, response.status);
    }

    const responseText = await response.text();

    if (!responseText.trim()) {
      throw new BadGatewayException(
        `Internal service returned an empty response for ${this.formatRequestPath(requestUrl)}`,
      );
    }

    try {
      return JSON.parse(responseText) as TResponse;
    } catch {
      return responseText as TResponse;
    }
  }

  async checkHealth(): Promise<HealthCheckResult> {
    return this.request<HealthCheckResult>('/api/shopping-carts/health', {
      method: 'GET',
    });
  }

  signUpUser(signUpRequestDto: SignUpRequestDto) {
    return this.request('/api/users/sign-up', {
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
}
