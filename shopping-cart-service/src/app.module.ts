import { Module } from '@nestjs/common';
import { ShoppingCartsModule } from './shopping-carts/shopping-carts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ShoppingCartsModule,
    // ConfigModule.forRoot({
    //   isGlobal: true,
    // }),
  ],
})
export class AppModule {}
