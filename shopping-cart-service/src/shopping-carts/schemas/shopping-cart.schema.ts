
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ShoppingCartDocument = HydratedDocument<ShoppingCart>;
export type ShoppingCartItemDocument = HydratedDocument<ShoppingCartItem>;

// Subdocument schema for items in the Shopping cart
@Schema({ timestamps: true })
export class ShoppingCartItem {
  @Prop({ type: Types.ObjectId, required: true })
  productId!: Types.ObjectId;

  @Prop({ type: Number, required: true })
  quantity!: number;
}

export const ShoppingCartItemSchema = SchemaFactory.createForClass(ShoppingCartItem);

// Main Shopping cart schema
@Schema({ timestamps: true })
export class ShoppingCart {
  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;
  
  @Prop({ type: [ShoppingCartItemSchema] })
  items: ShoppingCartItemDocument[] = [];
}

export const ShoppingCartSchema = SchemaFactory.createForClass(ShoppingCart);
