import { User } from '../schemas/user.schema';

export type SafeUserDto = Omit<User, 'hashedPassword'>;