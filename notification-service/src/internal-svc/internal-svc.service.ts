import { BadGatewayException, HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InternalSVCService {
  private readonly internalBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.internalBaseUrl =
      this.configService.get<string>('NGINX_PRIVATE_HTTP_URL') ??
      'http://nginx-private:8080';
  }

  private async request<TResponse>(
    path: string,
    options: { method?: string; body?: unknown } = {},
  ): Promise<TResponse> {
    const baseUrl = this.internalBaseUrl.endsWith('/')
      ? this.internalBaseUrl
      : `${this.internalBaseUrl}/`;
    const requestUrl = new URL(path.replace(/^\//, ''), baseUrl);

    const response = await firstValueFrom(
      this.httpService.request<string>({
        method: options.method ?? 'GET',
        url: requestUrl.toString(),
        data: options.body,
        responseType: 'text',
        validateStatus: () => true,
      }),
    );

    const responseBody = this.parseResponseBody(response.data);

    if (response.status < 200 || response.status >= 300) {
      throw new HttpException(
        responseBody ?? response.statusText,
        response.status,
      );
    }

    return responseBody as TResponse;
  }

  private parseResponseBody(body: string): unknown {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }

  // Example method to fetch user by ID from user-service
  async getUserById(userId: string) {
    return this.request(`/api/users/${userId}`, { method: 'GET' });
  }
}
