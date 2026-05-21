import { Injectable } from '@nestjs/common';

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
      throw new Error(
        `Internal service request failed (${response.status} ${response.statusText}) for ${requestUrl.toString()}: ${responseText}`,
      );
    }

    return (await response.json()) as TResponse;
  }

  async checkHealth(): Promise<HealthCheckResult> {
    return this.request<HealthCheckResult>('/api/shopping-carts/health', {
      method: 'GET',
    });
  }
}
