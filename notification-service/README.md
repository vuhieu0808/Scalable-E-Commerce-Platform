# Notification Service

A microservice for sending notifications (Email via Resend API, SMS) with RabbitMQ queue-based asynchronous processing.

## Architecture

### Design Patterns

- **Interface-based provider architecture**: Extensible notification channels via `NotificationProvider` interface
- **Factory pattern**: `NotificationProviderFactory` dynamically returns appropriate provider based on channel
- **Queue-based async processing**: Fire-and-forget model with RabbitMQ for decoupled, resilient notification delivery
- **Retry logic with exponential backoff**: Automatic retries (1s, 5s, 15s delays) for failed notifications

### Technology Stack

- **NestJS**: Framework with microservices support
- **RabbitMQ**: Message queue for async processing
- **Resend API**: Modern email delivery service
- **class-validator**: DTO validation
- **TypeScript**: Type-safe development

## Message Contract

### RabbitMQ event: `send_notification`

Notification messages are received asynchronously from RabbitMQ. The gateway publishes the payload and the service consumes it through the `send_notification` pattern.

**Event Payload:**

```json
{
  "messageId": "550e8400-e29b-41d4-a716-446655440000",
  "recipient": "user@example.com",
  "channel": "email",
  "type": "welcome",
  "data": {
    "userName": "Nguyen Van A",
    "userEmail": "user@example.com",
    "loginUrl": "https://example.com/login"
  }
}
```

**Processing result:**

No HTTP response is returned for message delivery. The service processes the message asynchronously and logs success or failure.

**Validation Rules:**

- `recipient`: Required, string (email format for email channel, phone format for sms)
- `channel`: Required, enum (`email` | `sms`)
- `type`: Required, enum (`welcome` | `order-confirmation` | `password-reset` | `email-verification` | `order-shipped` | `payment-success`)
- `data`: Optional, object containing template variables

**Available Notification Types:**

- `welcome`: Email chào mừng khi đăng ký
- `order-confirmation`: Xác nhận đơn hàng
- `password-reset`: Đặt lại mật khẩu
- `email-verification`: Xác thực email
- `order-shipped`: Thông báo đơn hàng đã gửi
- `payment-success`: Thanh toán thành công

### `GET /api/notifications/health`

Health check endpoint for monitoring.

**Response:**

```json
{
  "status": "OK"
}
```

## Environment Variables

```bash
# Server Configuration
PORT=3005

# RabbitMQ Configuration
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

# Internal Service Communication
NGINX_PRIVATE_HTTP_URL=http://nginx-private:8080

# Resend Email Provider
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev

# Retry Configuration
RETRY_MAX_ATTEMPTS=3
```

## Notification Channels

### Email (Resend API)

- **Provider**: `EmailResendProvider`
- **Features**: HTML templates, automatic subject generation, metadata tags, delivery tracking via Resend dashboard
- **Validation**: Email format validation
- **Configuration**: Requires `RESEND_API_KEY` and `RESEND_FROM_EMAIL`
- **Templates**: HTML files located in `src/notification/templates/email/`

### SMS (Stub Implementation)

- **Provider**: `SmsProvider`
- **Status**: Stub only (logs to console)
- **Future**: Integrate Twilio, AWS SNS, or similar provider
- **Validation**: Basic phone number format validation
- **Templates**: Text files located in `src/notification/templates/sms/`

## Template System

Notification-service sử dụng hệ thống template với các biến động `{{variableName}}`.

### Template Structure

```
src/notification/templates/
├── email/
│   ├── welcome.html
│   ├── order-confirmation.html
│   ├── password-reset.html
│   ├── email-verification.html
│   ├── order-shipped.html
│   └── payment-success.html
└── sms/
    ├── welcome.txt
    ├── order-confirmation.txt
    ├── password-reset.txt
    ├── email-verification.txt
    ├── order-shipped.txt
    └── payment-success.txt
```

### Template Variables by Type

**Welcome:**

- `userName`: Tên người dùng
- `userEmail`: Email người dùng
- `loginUrl`: Link đăng nhập

**Order Confirmation:**

- `userName`: Tên người dùng
- `orderId`: Mã đơn hàng
- `orderDate`: Ngày đặt hàng
- `totalAmount`: Tổng giá trị
- `orderUrl`: Link xem chi tiết

**Password Reset:**

- `userName`: Tên người dùng
- `resetUrl`: Link đặt lại mật khẩu
- `resetCode`: Mã xác nhận (for SMS)
- `expiryMinutes`: Số phút hết hạn

**Email Verification:**

- `userName`: Tên người dùng
- `verificationUrl`: Link xác thực
- `verificationCode`: Mã xác thực
- `expiryMinutes`: Số phút hết hạn

**Order Shipped:**

- `userName`: Tên người dùng
- `orderId`: Mã đơn hàng
- `trackingNumber`: Mã vận đơn
- `shippingCarrier`: Đơn vị vận chuyển
- `estimatedDelivery`: Thời gian dự kiến giao
- `trackingUrl`: Link theo dõi

**Payment Success:**

- `userName`: Tên người dùng
- `transactionId`: Mã giao dịch
- `amount`: Số tiền
- `paymentMethod`: Phương thức thanh toán
- `paymentTime`: Thời gian thanh toán
- `invoiceUrl`: Link hóa đơn

### Adding New Templates

1. **Create template files:**

```bash
# Email template
touch src/notification/templates/email/new-type.html

# SMS template
touch src/notification/templates/sms/new-type.txt
```

2. **Add type to enum** in `send-notification.dto.ts`:

```typescript
export enum NotificationType {
  // ...
  NEW_TYPE = 'new-type',
}
```

3. **Register in TemplateService** (`services/template.service.ts`):

```typescript
private readonly emailTemplateMap: Record<NotificationType, TemplateMetadata> = {
  // ...
  [NotificationType.NEW_TYPE]: {
    subject: 'Your subject here',
    fileName: 'new-type.html',
  },
};
```

## How It Works

### Flow Diagram

```
1. API Gateway generates messageId and emits `send_notification` to RabbitMQ
2. Notification service receives the message via `@MessagePattern('send_notification')`
3. Controller forwards payload to `NotificationService.processNotification()`
4. Factory resolves the provider (Email/SMS) from the channel
5. Provider sends the notification
6. Retry up to 3 times with backoff if the send fails
7. Log success/failure to console
```

### Retry Logic

- **Attempt 1**: Immediate
- **Attempt 2**: After 1 second delay
- **Attempt 3**: After 5 seconds delay (total)
- **Final failure**: After 15 seconds delay (total)

Configurable via `RETRY_MAX_ATTEMPTS` environment variable.

## Adding New Notification Channels

To add a new channel (e.g., Push Notifications, Webhooks):

1. **Create Provider** implementing `NotificationProvider`:

```typescript
// providers/push-notification.provider.ts
@Injectable()
export class PushNotificationProvider implements NotificationProvider {
  async send(recipient, subject, body, metadata) {
    // Implementation
  }

  validate(recipient) {
    // Validation logic
  }
}
```

2. **Register in Factory**:

```typescript
// providers/notification-provider.factory.ts
getProvider(channel: 'email' | 'sms' | 'push') {
  switch (channel) {
    case 'push':
      return this.pushProvider;
    // ...
  }
}
```

3. **Register in Module**:

```typescript
// notification.module.ts
providers: [
  PushNotificationProvider,
  // ...
];
```

4. **Update DTO enum**:

```typescript
// dto/send-notification.dto.ts
@IsEnum(['email', 'sms', 'push'])
channel!: 'email' | 'sms' | 'push';
```

## Development

### Prerequisites

- Node.js 22+
- pnpm
- Docker & Docker Compose
- RabbitMQ (via Docker)

### Installation

```bash
cd notification-service
pnpm install
```

### Running Locally

```bash
# Start RabbitMQ and notification-service
docker-compose up

# Or run notification-service only (requires external RabbitMQ)
pnpm run start:dev
```

### Accessing RabbitMQ Management UI

- **URL**: http://localhost:15672
- **Credentials**: guest / guest
- **Queue**: `notifications_queue`

### Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

### Linting

```bash
# Run ESLint
pnpm run lint

# Fix lint issues
pnpm run lint --fix

# Format code
pnpm run format
```

## Integration with Other Services

### From API Gateway

```typescript
// api-gateway-service/src/internal-svc/internal-svc.service.ts
await this.internalSVCService.sendNotification({
  recipient: 'user@example.com',
  channel: 'email',
  type: 'order-confirmation',
  data: {
    userName: 'Nguyễn Văn A',
    orderId: '123',
    orderDate: '2026-06-03',
    totalAmount: '1000000',
    orderUrl: 'https://example.com/orders/123',
  },
});
```

### From User Service (After Signup)

```typescript
// user-service/src/user/user.service.ts
try {
  await this.internalSVCService.sendNotification({
    recipient: user.email,
    channel: 'email',
    type: 'welcome',
    data: {
      userName: user.email.split('@')[0],
      userEmail: user.email,
      loginUrl: 'https://example.com/login',
    },
  });
} catch (error) {
  // Log but don't fail user creation
  this.logger.error('Failed to send welcome email:', error);
}
```

### Password Reset Email

```typescript
await this.internalSVCService.sendNotification({
  recipient: user.email,
  channel: 'email',
  type: 'password-reset',
  data: {
    userName: user.name,
    resetUrl: `https://example.com/reset-password?token=${resetToken}`,
    expiryMinutes: '15',
  },
});
```

### SMS Notification

```typescript
await this.internalSVCService.sendNotification({
  recipient: '+84912345678',
  channel: 'sms',
  type: 'order-shipped',
  data: {
    orderId: '123',
    trackingNumber: 'VN123456789',
    estimatedDelivery: '2026-06-05',
    trackingUrl: 'https://tracking.example.com/VN123456789',
  },
});
```

## Monitoring & Observability

### Logs

All notification processing is logged to console (captured by Docker):

- Queue events (notification queued)
- Processing starts (notification processing)
- Success (sent successfully with provider messageId)
- Retry attempts (failed attempt N/3)
- Final failure (failed after all retries)

### RabbitMQ Monitoring

- Check queue depth in management UI
- Monitor message rates (incoming/outgoing)
- Check consumer status

### Resend Dashboard

- View email delivery status
- Track open/click rates (if enabled)
- Monitor API usage and quotas

## Security Considerations

- ✅ **API Key protection**: `RESEND_API_KEY` stored in environment variables, never in code
- ✅ **Input validation**: All inputs validated via class-validator
- ✅ **Rate limiting**: Handled at nginx-public layer
- ✅ **CORS**: Configured in nginx-public for frontend access
- ✅ **No sensitive data exposure**: Responses only include messageId and status

## Troubleshooting

### Notifications not sending

1. Check RabbitMQ is running: `docker ps | grep rabbitmq`
2. Check queue has messages: http://localhost:15672 → Queues → notifications_queue
3. Check notification-service logs: `docker logs notification-service`
4. Verify `RESEND_API_KEY` is set correctly

### Email delivery failures

1. Check Resend dashboard for error details
2. Verify `RESEND_FROM_EMAIL` domain is verified in Resend
3. Check recipient email format is valid
4. Review retry logs in console

### Service won't start

1. Verify all environment variables are set
2. Check RabbitMQ connection: `RABBITMQ_URL` should point to accessible instance
3. Run `pnpm install` to ensure dependencies are installed
4. Check port 3005 is not in use

## Future Enhancements

- [ ] Implement SMS provider (Twilio/AWS SNS)

- [ ] Add push notification support (Firebase/OneSignal)

- [ ] Implement template engine (Handlebars) for reusable email templates

- [ ] Add webhook delivery callbacks for notification status

- [ ] Persist notification history to MongoDB for tracking

- [ ] Implement rate limiting per user/channel

- [ ] Add priority queues for urgent notifications

- [ ] Integrate with monitoring service (Prometheus/Grafana)

- [ ] Support batch notification sending

- [ ] Add scheduled notifications

## License

UNLICENSED
