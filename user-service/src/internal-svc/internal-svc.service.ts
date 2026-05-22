import { Injectable } from '@nestjs/common';
import {
  CreateShoppingCartRequestDto,
  InternalRequestOptionsDto,
} from './dto/internal-svc-request.dto';
import {
  CreateShoppingCartResponseDto,
  HealthCheckResponseDto,
} from './dto/internal-svc-response.dto';

@Injectable()
export class InternalSVCService {
  private readonly internalBaseUrl =
    process.env.NGINX_PRIVATE_HTTP_URL ?? 'http://nginx-private:8080';

  private async request<TResponse>(
    path: string,
    options: InternalRequestOptionsDto = {},
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
      throw new Error(
        `Internal service request failed (${response.status} ${response.statusText}) for ${requestUrl.toString()}: ${responseText}`,
      );
    }

    return (await response.json()) as TResponse;
  }

  async checkHealth(): Promise<HealthCheckResponseDto> {
    const healthCheckResult = await this.request<HealthCheckResponseDto>(
      '/api/shopping-carts/health',
      {
        method: 'GET',
      },
    );

    return healthCheckResult;
  }

  async createShoppingCart(
    userId: string,
  ): Promise<CreateShoppingCartResponseDto> {
    const requestBody: CreateShoppingCartRequestDto = {
      userId,
    };

    const createdShoppingCart =
      await this.request<CreateShoppingCartResponseDto>('/api/shopping-carts', {
        method: 'POST',
        body: requestBody,
      });

    return createdShoppingCart;
  }
}
