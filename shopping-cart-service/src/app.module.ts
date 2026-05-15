import { Module } from '@nestjs/common';
import { ShoppingCartsModule } from './shopping-carts/shopping-carts.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [ShoppingCartsModule],
})
export class AppModule {}
