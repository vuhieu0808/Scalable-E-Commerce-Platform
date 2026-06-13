# API Gateway Service - AI Context

## 1) Mục đích dịch vụ

- Là điểm vào backend cho client public (qua nginx-public).
- Gom và điều phối request giữa User Service và Shopping Cart Service.
- Chuẩn hóa validate input ở tầng gateway trước khi đẩy vào service nội bộ.

## 2) Vị trí trong kiến trúc

- Nhận request từ nginx-public tại các route /users/_ và /shopping-carts/_ (đã rewrite).
- Gọi nginx-private qua biến NGINX_PRIVATE_HTTP_URL, sau đó nginx-private mới route tới các service nội bộ.

Luồng chính:

1. Client -> nginx-public
2. nginx-public rewrite route -> /api-gateway/\*
3. api-gateway-service -> internal HTTP client -> nginx-private
4. nginx-private -> user-service hoặc shopping-cart-service

## 3) Stack kỹ thuật

- NestJS 11, TypeScript
- @nestjs/axios để gọi internal HTTP
- class-validator + class-transformer
- ValidationPipe global: transform=true, whitelist=true, forbidNonWhitelisted=true

## 4) Cấu trúc code quan trọng

- src/main.ts: bootstrap + global validation pipe + port
- src/app.module.ts: ConfigModule global + ApiGatewayModule
- src/api-gateway/api-gateway.controller.ts: định nghĩa endpoint public của gateway
- src/api-gateway/api-gateway.service.ts: lớp orchestration, gọi InternalSVCService
- src/internal-svc/internal-svc.service.ts: HTTP client nội bộ với xử lý lỗi thống nhất
- src/internal-svc/dto/\*: DTO request/response dùng cho validate và typing

## 5) Endpoint hiện có

Base controller: /api-gateway

User:

- POST /api-gateway/users/sign-up
- GET /api-gateway/users/health
- POST /api-gateway/users/sign-in
- GET /api-gateway/users/:id
- PATCH /api-gateway/users/:id
- DELETE /api-gateway/users/:id

Shopping cart:

- GET /api-gateway/shopping-carts/health
- GET /api-gateway/shopping-carts/user/:userId
- POST /api-gateway/shopping-carts/items
- PATCH /api-gateway/shopping-carts/user/:userId
- DELETE /api-gateway/shopping-carts/user/:userId

Ghi chú:

- Luồng sign-up có orchestration: tạo user xong sẽ tự gọi createShoppingCart.
- Notification không đi qua HTTP downstream nữa; gateway phát RabbitMQ event `send_notification` qua InternalSVCService.

## 6) Cách code và pattern đang dùng

- Controller mỏng, business logic nằm ở service.
- Gateway service chủ yếu forward sang InternalSVCService.
- InternalSVCService dùng hàm request<T>() generic:
  - Tự parse text response thành JSON nếu parse được.
  - Nếu status không phải 2xx: throw HttpException giữ nguyên status downstream.
  - Nếu body rỗng: throw BadGatewayException.
- DTO có message lỗi rõ ràng cho class-validator.
- Luồng notification là ngoại lệ so với HTTP forward: InternalSVCService dùng RabbitMQ ClientProxy để emit thay vì request POST.

## 7) Quy ước tích hợp nội bộ

- Đường dẫn nội bộ luôn dùng prefix /api/\* khi gọi nginx-private.
- internalBaseUrl mặc định: http://nginx-private:8080
- Method map quan trọng:
  - update shopping cart ở gateway đang gọi method PUT vào downstream.
  - notification đang dùng queue `notifications_queue` và pattern `send_notification`.

## 8) Environment và vận hành

Biến môi trường chính:

- PORT (default 3000)
- NGINX_PRIVATE_HTTP_URL (default http://nginx-private:8080)
- NODE_ENV

Chạy dev (docker-compose dịch vụ):

- command: pnpm --filter api-gateway-service start:dev
- Dockerfile.dev dùng Node 22 alpine + pnpm store volume.

## 9) Rủi ro và điểm cần lưu ý cho AI

- Đây là gateway orchestration, không nên thêm business logic nặng tại đây.
- Cần giữ nhất quán method HTTP giữa gateway và downstream.
- Nếu đổi route ở user-service/shopping-cart-service thì phải cập nhật cả:
  - InternalSVCService path
  - nginx-private location
  - nginx-public rewrite

## 10) Khi AI cần mở rộng service này

Checklist:

1. Thêm DTO request/response trước.
2. Thêm method ở InternalSVCService với typing rõ ràng.
3. Thêm method tương ứng ở ApiGatewayService.
4. Expose endpoint ở ApiGatewayController.
5. Đồng bộ route nginx-public/nginx-private nếu endpoint là public path mới.
6. Bổ sung test integration (hiện chưa có coverage đặc thù cho luồng orchestration).
7. Với notification, ưu tiên emit RabbitMQ thay vì HTTP để giữ kiến trúc event-driven.
