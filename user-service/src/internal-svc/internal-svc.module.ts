import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { InternalSVCService } from './internal-svc.service';

@Module({
  imports: [HttpModule],
  providers: [InternalSVCService],
  exports: [InternalSVCService],
})
export class InternalSVCModule {}
