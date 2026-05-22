export type InternalRequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type InternalRequestOptionsDto = {
  method?: InternalRequestMethod;
  body?: unknown;
};

export type CreateShoppingCartRequestDto = {
  userId: string;
};