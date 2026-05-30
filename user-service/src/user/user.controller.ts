import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('health')
  async health() {
    return { status: 'OK' };
  }

  @Post('sign-up')
  async signUp(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.signUp(createUserDto);
    return user;
  }

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto) {
    const user = await this.userService.signIn(signInDto);
    return user;
  }

  @Get(':id')
  async findUserById(@Param('id') id: string) {
    const user = await this.userService.findUserById(id);
    return user;
  }

  @Patch(':id')
  async updateUserById(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.updateUserById(id, updateUserDto);
    return user;
  }

  @Delete(':id')
  async deleteUserById(@Param('id') id: string) {
    const user = await this.userService.deleteUserById(id);
    return user;
  }
}
