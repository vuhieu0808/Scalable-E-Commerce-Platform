import {
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class SendNotificationRequestDto {
  @IsString({ message: 'Recipient must be a string' })
  @IsNotEmpty({ message: 'Recipient is required' })
  recipient!: string;

  @IsIn(['email', 'sms'], { message: 'Channel must be email or sms' })
  @IsNotEmpty({ message: 'Channel is required' })
  channel!: 'email' | 'sms';

  @IsIn(
    [
      'welcome',
      'order-confirmation',
      'password-reset',
      'email-verification',
      'order-shipped',
      'payment-success',
    ],
    { message: 'Type is invalid' },
  )
  @IsNotEmpty({ message: 'Type is required' })
  type!:
    | 'welcome'
    | 'order-confirmation'
    | 'password-reset'
    | 'email-verification'
    | 'order-shipped'
    | 'payment-success';

  @IsOptional()
  @IsObject({ message: 'Data must be an object' })
  data?: Record<string, unknown>;
}
