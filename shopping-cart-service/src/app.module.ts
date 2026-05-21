import { Module } from '@nestjs/common';
import { ShoppingCartsModule } from './shopping-carts/shopping-carts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ShoppingCartsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-cart')
  ],
})
export class AppModule {}
