import { Module } from '@nestjs/common';
import { ApiGatewayModule } from './api-gateway/api-gateway.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ApiGatewayModule,
    ConfigModule.forRoot({
      isGlobal: true,
    })
  ],
})
export class AppModule {}
