import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { NotificationProvider } from '../interfaces/notification-provider.interface';
import { NotificationType } from '../dto/send-notification.dto';
import { TemplateService } from '../templates/template.service';

@Injectable()
export class EmailResendProvider implements NotificationProvider {
  private readonly logger = new Logger(EmailResendProvider.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly templateService: TemplateService,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not configured');
    }
    this.resend = new Resend(apiKey);
    this.fromEmail =
      this.configService.get<string>('RESEND_FROM_EMAIL') ||
      'onboarding@resend.dev';
  }

  async send(
    recipient: string,
    type: NotificationType,
    data?: Record<string, unknown>,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.validate(recipient)) {
        return {
          success: false,
          error: 'Invalid email format',
        };
      }

      // Lấy subject và HTML body từ template
      const subject = this.templateService.getEmailSubject(type, data);
      console.log(`Generated email subject for type ${type}: ${subject}`);
      const htmlBody = this.templateService.getEmailTemplate(type, data);

      this.logger.log(`Sending email to ${recipient}, type: ${type}`);

      const { data: responseData, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: recipient,
        subject: subject,
        html: htmlBody,
      });

      if (error) {
        this.logger.error(
          `Failed to send email to ${recipient}: ${error.message || error}`,
        );
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }

      this.logger.log(
        `Email sent successfully to ${recipient}, type: ${type}, ID: ${responseData?.id}`,
      );
      return {
        success: true,
        messageId: responseData?.id,
      };
    } catch (error) {
      this.logger.error(`Email sending error: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  validate(recipient: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(recipient);
  }
}
