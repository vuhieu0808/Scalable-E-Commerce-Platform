import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { InternalSVCModule } from '../internal-svc/internal-svc.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    InternalSVCModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
