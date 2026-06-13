import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationProviderFactory } from './providers/notification-provider.factory';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly retryMaxAttempts: number;
  private readonly retryDelays = [1000, 5000, 15000]; // 1s, 5s, 15s

  constructor(
    private readonly configService: ConfigService,
    private readonly providerFactory: NotificationProviderFactory,
  ) {
    this.retryMaxAttempts = parseInt(
      this.configService.get<string>('RETRY_MAX_ATTEMPTS') || '3',
      10,
    );
  }

  /**
   * Process notification from RabbitMQ queue
   * Called by message handler
   */
  async processNotification(
    payload: SendNotificationDto & { messageId: string },
  ): Promise<void> {
    const { messageId, recipient, channel, type, data } = payload;

    this.logger.log(
      `Processing notification ${messageId} for ${recipient} via ${channel}, type: ${type}`,
    );

    let lastError: string | undefined;

    // Retry logic with exponential backoff
    for (let attempt = 1; attempt <= this.retryMaxAttempts; attempt++) {
      try {
        const provider = this.providerFactory.getProvider(channel);
        const result = await provider.send(recipient, type, data);

        if (result.success) {
          this.logger.log(
            `Notification ${messageId} sent successfully (attempt ${attempt}/${this.retryMaxAttempts}), provider messageId: ${result.messageId}`,
          );
          return;
        }

        lastError = result.error;
        this.logger.warn(
          `Notification ${messageId} failed (attempt ${attempt}/${this.retryMaxAttempts}): ${result.error}`,
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        lastError = errorMessage;
        this.logger.error(
          `Notification ${messageId} error (attempt ${attempt}/${this.retryMaxAttempts}): ${errorMessage}`,
        );
      }

      // Wait before retry (except on last attempt)
      if (attempt < this.retryMaxAttempts) {
        const delay = this.retryDelays[attempt - 1] || 15000;
        await this.sleep(delay);
      }
    }

    // All retries failed
    this.logger.error(
      `Notification ${messageId} failed after ${this.retryMaxAttempts} attempts. Last error: ${lastError}`,
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
