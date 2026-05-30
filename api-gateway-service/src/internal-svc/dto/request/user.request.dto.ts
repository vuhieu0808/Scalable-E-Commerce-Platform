import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignUpRequestDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}

export class SignInRequestDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}

export class UpdateUserRequestDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber?: string;
}