import { Injectable, BadRequestException } from '@nestjs/common';
import { NotificationProvider } from '../interfaces/notification-provider.interface';
import { EmailResendProvider } from './email-resend.provider';
import { SmsProvider } from './sms.provider';

@Injectable()
export class NotificationProviderFactory {
  constructor(
    private readonly emailProvider: EmailResendProvider,
    private readonly smsProvider: SmsProvider,
  ) {}

  getProvider(channel: 'email' | 'sms'): NotificationProvider {
    switch (channel) {
      case 'email':
        return this.emailProvider;
      case 'sms':
        return this.smsProvider;
      default:
        throw new BadRequestException(`Unsupported notification channel: ${channel}`);
    }
  }
}
