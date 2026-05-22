import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { InternalSVCService } from '../internal-svc/internal-svc.service';
import { CreateShoppingCartResponseDto } from '../internal-svc/dto/internal-svc-response.dto';
import { SafeUserDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly internalSVCService: InternalSVCService,
  ) {}

  private toSafeUser(user: UserDocument): SafeUserDto {
    const { hashedPassword: _, ...safeUser } = user.toObject();
    return safeUser;
  }

  async signUp(createUserDto: CreateUserDto): Promise<SafeUserDto> {
    const { email, password } = createUserDto;

    const userExists = await this.userModel.findOne({ email });
    if (userExists) {
      throw new ConflictException('User already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const createdUser = await new this.userModel({
      email,
      hashedPassword,
    }).save();

    try {
      const createdShoppingCart: CreateShoppingCartResponseDto =
        await this.internalSVCService.createShoppingCart(
          createdUser._id.toString(),
        );
      const cartObjectId = new Types.ObjectId(createdShoppingCart._id);
      createdUser.cartId = cartObjectId;

      const updatedUser = await createdUser.save();
      const safeUser = this.toSafeUser(updatedUser);
      return safeUser;
    } catch (error) {
      await this.userModel.findByIdAndDelete(createdUser._id);
      throw new InternalServerErrorException(
        'Error occurred while creating user',
      );
    }
  }

  async signIn(signInDto: SignInDto): Promise<SafeUserDto> {
    const { email, password } = signInDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const safeUser = this.toSafeUser(user);
    return safeUser;
  }

  async findUserById(id: string): Promise<SafeUserDto> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const safeUser = this.toSafeUser(user);
    return safeUser;
  }

  async updateUserById(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<SafeUserDto> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      {
        new: true,
      },
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    const safeUser = this.toSafeUser(updatedUser);
    return safeUser;
  }

  async deleteUserById(id: string): Promise<SafeUserDto> {
    const deletedUser = await this.userModel.findByIdAndDelete(id);

    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }

    const safeUser = this.toSafeUser(deletedUser);
    return safeUser;
  }
}
