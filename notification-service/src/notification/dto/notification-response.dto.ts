export class NotificationResponseDto {
  messageId: string;
  status: 'queued';
  queuedAt: Date;

  constructor(messageId: string) {
    this.messageId = messageId;
    this.status = 'queued';
    this.queuedAt = new Date();
  }
}
