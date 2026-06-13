import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { EmailResendProvider } from './providers/email-resend.provider';
import { SmsProvider } from './providers/sms.provider';
import { NotificationProviderFactory } from './providers/notification-provider.factory';
import { TemplateService } from './templates/template.service';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    EmailResendProvider,
    SmsProvider,
    NotificationProviderFactory,
    TemplateService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
