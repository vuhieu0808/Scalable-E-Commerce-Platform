# Notification Service - AI Context

## 1) Mục đích hiện tại

- Service này là worker notification theo mô hình RabbitMQ consumer.
- Không còn nhận notification payload qua REST; chỉ giữ health check HTTP và handler `send_notification` từ queue.

## 2) Trạng thái code hiện tại

- src/notification/notification.controller.ts: GET /api/notifications/health và @MessagePattern('send_notification').
- src/notification/notification.service.ts: processNotification() xử lý provider và retry; không còn REST queue method.
- src/notification/notification.module.ts: wire NotificationService, provider factory, template service.
- src/main.ts: bootstrap + ValidationPipe global + RabbitMQ microservice connection.

## 3) Stack kỹ thuật

- NestJS 11, TypeScript
- RabbitMQ qua @nestjs/microservices
- @nestjs/axios cho provider outbound nếu cần gọi external API

## 4) API hiện có

- GET /api/notifications/health
- RabbitMQ pattern: send_notification

## 5) Cách code hiện tại

- Controller mỏng, chỉ nhận health check và message pattern.
- Business logic nằm trong service và provider abstraction.
- DTO `SendNotificationDto` chuẩn hóa payload nhận từ gateway.

## 6) Hàm ý kiến trúc

- Notification đã được tách khỏi luồng đồng bộ của các service chính.
- Luồng chuẩn là API Gateway phát event sang RabbitMQ, service này consume và xử lý bất đồng bộ.

## 7) Khi AI mở rộng service này

Checklist khởi tạo nhanh:

1. Giữ payload contract giữa gateway và consumer đồng bộ.
2. Thêm provider theo channel: EmailProvider, SmsProvider, PushProvider.
3. Thêm idempotency key và retry policy nếu mở rộng độ tin cậy.
4. Thêm logging và dead-letter strategy nếu dùng queue.
5. Nếu cần response/ack, tách riêng event status thay vì quay lại REST send endpoint.

## 8) Khuyến nghị triển khai thực tế

- Nếu dùng email: ưu tiên provider abstraction (SES/SendGrid/Mailgun).
- Lưu lịch sử gửi để audit và debug.
- Có rate limit theo user/channel để chống spam.
- Tách template rendering (Handlebars/Nunjucks) khỏi transport layer.

## 9) Lưu ý vận hành

- Hiện chưa có docker-compose.dev.yml riêng trong thư mục này.
- Nếu tích hợp vào hệ thống hiện tại, cần bổ sung compose include và route qua gateway/nginx nếu muốn public API.
