import { BadGatewayException, HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

type InternalRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
};

@Injectable()
export class InternalSVCService {
  constructor(private readonly httpService: HttpService) {}

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
    )) as {
      status: number;
      statusText: string;
      data: string;
    };

    const responseBody = this.parseResponseBody(response.data);

    if (response.status < 200 || response.status >= 300) {
      throw new HttpException(
        responseBody ?? response.statusText,
        response.status,
      );
    }

    if (responseBody === undefined) {
      throw new BadGatewayException(
        `Internal service returned an empty response for ${requestUrl.toString()}`,
      );
    }

    return responseBody as TResponse;
  }

  
}
