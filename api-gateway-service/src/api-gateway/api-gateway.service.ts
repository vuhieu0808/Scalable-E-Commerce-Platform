import { Injectable } from '@nestjs/common';
import { InternalSVCService } from '../internal-svc/internal-svc.service';

@Injectable()
export class ApiGatewayService {
  constructor(
    private readonly internalSVCService: InternalSVCService,
  ) {}

  async getOrder(orderId: string) {
    
  }

  async checkHealth() {
    return this.internalSVCService.checkHealth();
  }
}
