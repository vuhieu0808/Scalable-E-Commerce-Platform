import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { NotificationType } from '../dto/send-notification.dto';

interface TemplateMetadata {
  subject: string;
  fileName: string;
}

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  // Mapping của notification type sang template metadata
  private readonly emailTemplateMap: Record<
    NotificationType,
    TemplateMetadata
  > = {
    [NotificationType.WELCOME]: {
      subject: 'Chào mừng đến với Scalable E-Commerce Platform!',
      fileName: 'welcome.html',
    },
    [NotificationType.ORDER_CONFIRMATION]: {
      subject: 'Xác nhận đơn hàng #{orderId}',
      fileName: 'order-confirmation.html',
    },
    [NotificationType.PASSWORD_RESET]: {
      subject: 'Yêu cầu đặt lại mật khẩu',
      fileName: 'password-reset.html',
    },
    [NotificationType.EMAIL_VERIFICATION]: {
      subject: 'Xác thực địa chỉ email của bạn',
      fileName: 'email-verification.html',
    },
    [NotificationType.ORDER_SHIPPED]: {
      subject: 'Đơn hàng #{orderId} đang được giao',
      fileName: 'order-shipped.html',
    },
    [NotificationType.PAYMENT_SUCCESS]: {
      subject: 'Thanh toán thành công',
      fileName: 'payment-success.html',
    },
  };

  private readonly smsTemplateMap: Record<NotificationType, string> = {
    [NotificationType.WELCOME]: 'welcome.txt',
    [NotificationType.ORDER_CONFIRMATION]: 'order-confirmation.txt',
    [NotificationType.PASSWORD_RESET]: 'password-reset.txt',
    [NotificationType.EMAIL_VERIFICATION]: 'email-verification.txt',
    [NotificationType.ORDER_SHIPPED]: 'order-shipped.txt',
    [NotificationType.PAYMENT_SUCCESS]: 'payment-success.txt',
  };

  /**
   * Lấy subject cho email notification
   */
  getEmailSubject(
    type: NotificationType,
    data?: Record<string, unknown>,
  ): string {
    const metadata = this.emailTemplateMap[type];
    if (!metadata) {
      throw new NotFoundException(`Email template not found for type: ${type}`);
    }

    return this.replaceVariables(metadata.subject, data || {});
  }

  /**
   * Lấy HTML content cho email notification
   */
  getEmailTemplate(
    type: NotificationType,
    data?: Record<string, unknown>,
  ): string {
    const metadata = this.emailTemplateMap[type];
    if (!metadata) {
      throw new NotFoundException(`Email template not found for type: ${type}`);
    }

    const templatePath = join(
      __dirname,
      '..',
      'src',
      'notification',
      'templates',
      'email',
      metadata.fileName,
    );

    console.log(`Loading email template from: ${templatePath}`);
    console.log(`Data for email template:`, data);

    try {
      const template = readFileSync(templatePath, 'utf-8');
      return this.replaceVariables(template, data || {});
    } catch (error) {
      this.logger.error(
        `Failed to read email template ${metadata.fileName}: ${error}`,
      );
      throw new NotFoundException(
        `Email template file not found: ${metadata.fileName}`,
      );
    }
  }

  /**
   * Lấy text content cho SMS notification
   */
  getSmsTemplate(
    type: NotificationType,
    data?: Record<string, unknown>,
  ): string {
    const fileName = this.smsTemplateMap[type];
    if (!fileName) {
      throw new NotFoundException(`SMS template not found for type: ${type}`);
    }

    const templatePath = join(
      __dirname,
      '..',
      'src',
      'notification',
      'templates',
      'sms',
      fileName,
    );

    try {
      const template = readFileSync(templatePath, 'utf-8');
      return this.replaceVariables(template, data || {});
    } catch (error) {
      this.logger.error(`Failed to read SMS template ${fileName}: ${error}`);
      throw new NotFoundException(`SMS template file not found: ${fileName}`);
    }
  }

  /**
   * Thay thế các biến {{variableName}} trong template bằng giá trị từ data
   */
  private replaceVariables(
    template: string,
    data: Record<string, unknown>,
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = data[key];
      return value !== undefined ? String(value) : match;
    });
  }
}
