import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { SendNotificationDto } from './dto/send-notification.dto';

@Controller('api/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('health')
  health() {
    return { status: 'OK' };
  }

  /**
   * RabbitMQ message handler
   * Listens to 'send_notification' pattern and processes notifications
   */
  @MessagePattern('send_notification')
  async handleNotificationMessage(
    @Payload() data: SendNotificationDto & { messageId: string },
  ): Promise<void> {
    await this.notificationService.processNotification(data);
  }
}
