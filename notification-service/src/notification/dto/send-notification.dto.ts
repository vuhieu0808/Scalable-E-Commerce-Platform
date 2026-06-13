import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export enum NotificationType {
  WELCOME = 'welcome',
  ORDER_CONFIRMATION = 'order-confirmation',
  PASSWORD_RESET = 'password-reset',
  EMAIL_VERIFICATION = 'email-verification',
  ORDER_SHIPPED = 'order-shipped',
  PAYMENT_SUCCESS = 'payment-success',
}

export class SendNotificationDto {
  @IsNotEmpty({ message: 'Recipient is required' })
  @IsString({ message: 'Recipient must be a string' })
  recipient!: string;

  @IsNotEmpty({ message: 'Channel is required' })
  @IsEnum(['email', 'sms'], { message: 'Channel must be email or sms' })
  channel!: 'email' | 'sms';

  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum(NotificationType, { message: 'Invalid notification type' })
  type!: NotificationType;

  @IsOptional()
  data?: Record<string, unknown>;
}
