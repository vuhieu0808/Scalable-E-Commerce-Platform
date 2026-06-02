# Notification Service - AI Context

## 1) Mục đích hiện tại
- Service này đang ở trạng thái scaffold mặc định NestJS.
- Chưa chứa logic notification thực tế (email/SMS/push/event-driven).

## 2) Trạng thái code hiện tại
- src/app.controller.ts: 1 endpoint GET / trả chuỗi Hello World.
- src/app.service.ts: getHello() trả về Hello World.
- src/app.module.ts: chỉ import controller + provider mặc định.
- src/main.ts: bootstrap cơ bản, chưa bật ValidationPipe global.

## 3) Stack kỹ thuật
- NestJS 11, TypeScript
- Có dependency @nestjs/axios nhưng hiện chưa sử dụng trong code.

## 4) API hiện có
- GET /

## 5) Cách code hiện tại
- Mẫu starter mặc định của Nest CLI.
- Chưa có cấu trúc module theo domain.
- Chưa có DTO/schema/entity riêng.

## 6) Hàm ý kiến trúc
- Đây là chỗ phù hợp để tách notification ra khỏi luồng đồng bộ của các service chính.
- Có thể triển khai theo 2 hướng:
  1. Synchronous API (REST) để gửi notification trực tiếp.
  2. Event-driven (Kafka/RabbitMQ/Redis streams) để xử lý bất đồng bộ.

## 7) Khi AI mở rộng service này
Checklist khởi tạo nhanh:
1. Thêm ValidationPipe global trong main.ts.
2. Tạo NotificationModule riêng.
3. Tạo DTO cho payload gửi thông báo (recipient/channel/template/data).
4. Thêm provider theo channel: EmailProvider, SmsProvider, PushProvider.
5. Thêm idempotency key và retry policy.
6. Thêm logging và dead-letter strategy nếu dùng queue.

## 8) Khuyến nghị triển khai thực tế
- Nếu dùng email: ưu tiên provider abstraction (SES/SendGrid/Mailgun).
- Lưu lịch sử gửi để audit và debug.
- Có rate limit theo user/channel để chống spam.
- Tách template rendering (Handlebars/Nunjucks) khỏi transport layer.

## 9) Lưu ý vận hành
- Hiện chưa có docker-compose.dev.yml riêng trong thư mục này.
- Nếu tích hợp vào hệ thống hiện tại, cần bổ sung compose include và route qua gateway/nginx nếu muốn public API.
