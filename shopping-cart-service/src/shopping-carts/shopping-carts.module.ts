import { Module } from '@nestjs/common';
import { ShoppingCartsService } from './shopping-carts.service';
import { ShoppingCartsController } from './shopping-carts.controller';
import { ShoppingCart, ShoppingCartSchema } from './schemas/shopping-cart.schema';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: ShoppingCart.name, schema: ShoppingCartSchema }])],
  controllers: [ShoppingCartsController],
  providers: [ShoppingCartsService],
})
export class ShoppingCartsModule {}
