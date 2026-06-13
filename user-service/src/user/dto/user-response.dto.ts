import { User } from '../entities/user.entity';

export type SafeUserDto = Omit<User, 'hashedPassword'>;
