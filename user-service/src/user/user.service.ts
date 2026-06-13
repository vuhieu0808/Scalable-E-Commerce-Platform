import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { isUUID } from 'class-validator';
import { Not, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { SafeUserDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private toSafeUser(user: User): SafeUserDto {
    const { hashedPassword: _, ...safeUser } = user;
    return safeUser;
  }

  async signUp(createUserDto: CreateUserDto): Promise<SafeUserDto> {
    const { email, password } = createUserDto;

    const userExists = await this.userRepository.findOne({ where: { email } });
    if (userExists) {
      throw new ConflictException('User already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const createdUser = await this.userRepository.save(
      this.userRepository.create({
        email,
        hashedPassword,
      }),
    );

    return this.toSafeUser(createdUser);
  }

  async signIn(signInDto: SignInDto): Promise<SafeUserDto> {
    const { email, password } = signInDto;

    const user = await this.userRepository.findOne({ where: { email } });
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
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid user id');
    }

    const user = await this.userRepository.findOne({ where: { id } });
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
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid user id');
    }

    const existingUser = await this.userRepository.findOne({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const duplicateUser = await this.userRepository.findOne({
        where: {
          email: updateUserDto.email,
          id: Not(id),
        },
      });

      if (duplicateUser) {
        throw new ConflictException('User already exists');
      }
    }

    const updatedUser = await this.userRepository.save({
      ...existingUser,
      ...updateUserDto,
    });

    const safeUser = this.toSafeUser(updatedUser);
    return safeUser;
  }

  async deleteUserById(id: string): Promise<SafeUserDto> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid user id');
    }

    const deletedUser = await this.userRepository.findOne({ where: { id } });

    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(deletedUser);

    const safeUser = this.toSafeUser(deletedUser);
    return safeUser;
  }
}
