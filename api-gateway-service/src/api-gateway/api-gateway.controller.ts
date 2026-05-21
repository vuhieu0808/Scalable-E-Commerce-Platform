import { Controller, Get, Param } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';

@Controller('api-gateway')
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get('get-order/:orderId')
  getOrder(@Param('orderId') orderId: string) {
    return this.apiGatewayService.getOrder(orderId);
  }

  @Get('shopping-carts/health')
  checkHealth() {
    return this.apiGatewayService.checkHealth();
  }
}
