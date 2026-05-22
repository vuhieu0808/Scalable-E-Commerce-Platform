import { Module } from '@nestjs/common';
import { InternalSVCService } from './internal-svc.service';

@Module({
  providers: [InternalSVCService],
  exports: [InternalSVCService],
})
export class InternalSVCModule {}
