
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

// Main User schema
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email!: string;
  
  @Prop({ required: true })
  hashedPassword!: string;

  // information about the user

  @Prop()
  name?: string;

  @Prop()
  address?: string;
  
  @Prop()
  phoneNumber?: string;

}

export const UserSchema = SchemaFactory.createForClass(User);
