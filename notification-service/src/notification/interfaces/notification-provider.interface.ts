import { NotificationType } from '../dto/send-notification.dto';

export interface NotificationProvider {
  /**
   * Send notification to recipient
   * @param recipient - Email address or phone number
   * @param type - Notification type (determines template to use)
   * @param data - Data to populate template variables
   * @returns Promise with success status
   */
  send(
    recipient: string,
    type: NotificationType,
    data?: Record<string, unknown>,
  ): Promise<{ success: boolean; messageId?: string; error?: string }>;

  /**
   * Validate recipient format
   * @param recipient - Email address or phone number
   * @returns True if valid
   */
  validate(recipient: string): boolean;
}
