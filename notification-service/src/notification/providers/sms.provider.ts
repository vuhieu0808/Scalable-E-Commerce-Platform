import { Injectable, Logger } from '@nestjs/common';
import { NotificationProvider } from '../interfaces/notification-provider.interface';
import { NotificationType } from '../dto/send-notification.dto';
import { TemplateService } from '../templates/template.service';

@Injectable()
export class SmsProvider implements NotificationProvider {
  private readonly logger = new Logger(SmsProvider.name);

  constructor(private readonly templateService: TemplateService) {}

  async send(
    recipient: string,
    type: NotificationType,
    data?: Record<string, unknown>,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.validate(recipient)) {
        return {
          success: false,
          error: 'Invalid phone number format',
        };
      }

      // Lấy SMS content từ template
      const message = this.templateService.getSmsTemplate(type, data);

      // TODO: Implement actual SMS provider (Twilio, AWS SNS, etc.)
      this.logger.log(
        `SMS stub: Would send to ${recipient}, type: ${type}, message: ${message.substring(0, 50)}...`,
      );

      return {
        success: true,
        messageId: `sms-stub-${Date.now()}`,
      };
    } catch (error) {
      this.logger.error(`SMS sending error: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  validate(recipient: string): boolean {
    // Basic phone number validation (accepts various formats)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(recipient.replace(/[\s()-]/g, ''));
  }
}
