# User Service - AI Context

## 1) Mục đích dịch vụ
- Quản lý tài khoản người dùng: đăng ký, đăng nhập, xem/sửa/xóa profile.
- Lưu dữ liệu user trong MongoDB.
- Trả về SafeUser (không lộ hashedPassword).

## 2) Stack kỹ thuật
- NestJS 11, TypeScript
- MongoDB + Mongoose
- bcrypt để hash/verify password
- class-validator + class-transformer
- ValidationPipe global ở main.ts

## 3) Cấu trúc code chính
- src/main.ts: bootstrap + validation + PORT (default 3003)
- src/app.module.ts:
  - ConfigModule global
  - MongooseModule.forRoot(MONGODB_URI)
  - import UserModule
- src/user/*:
  - user.controller.ts
  - user.service.ts
  - dto/*
  - schemas/user.schema.ts
- src/internal-svc/*:
  - internal-svc.service.ts gọi shopping-cart health/create
  - dto/internal-svc-request.dto.ts, dto/internal-svc-response.dto.ts

## 4) Schema dữ liệu
User:
- email: required, unique
- hashedPassword: required
- name, address, phoneNumber: optional
- timestamps: createdAt, updatedAt

## 5) Endpoint hiện có
Base path: /api/users
- GET /health
- POST /sign-up
- POST /sign-in
- GET /:id
- PATCH /:id
- DELETE /:id

## 6) Hành vi nghiệp vụ
- signUp:
  - Kiểm tra email tồn tại -> ConflictException nếu trùng.
  - Hash password bằng bcrypt (salt rounds = 10).
  - Lưu user và trả SafeUser.
- signIn:
  - Tìm theo email.
  - compare password bằng bcrypt.
  - Sai email/password -> UnauthorizedException.
- find/update/delete by id:
  - Validate ObjectId trước bằng Types.ObjectId.isValid.
  - Không tìm thấy -> NotFoundException.

## 7) Cách code và pattern
- Có helper toSafeUser để remove hashedPassword tập trung.
- Exception mapping rõ ràng theo use case: Conflict, Unauthorized, BadRequest, NotFound.
- DTO đặt message validate cụ thể.
- internal-svc module đã import vào UserModule để chuẩn bị tích hợp cross-service.

Ghi chú quan trọng:
- UserService hiện inject InternalSVCService nhưng chưa gọi createShoppingCart trong signUp.
- Orchestration tạo cart đang diễn ra ở api-gateway-service.

## 8) Environment và vận hành
Biến môi trường chính:
- PORT (default 3003)
- MONGODB_URI (mặc định hiện đang trỏ mongodb://localhost:27017/shopping-cart)
- NGINX_PRIVATE_HTTP_URL

Docker:
- docker-compose.dev.yml chạy watch mode.
- upstream nội bộ qua nginx-private name user-service:3003.

## 9) Rủi ro và điểm cần lưu ý cho AI
- Mặc định MONGODB_URI fallback đang dùng database shopping-cart; cần đảm bảo env thật đã tách DB user.
- updateUserById cho phép cập nhật email, nên cần cân nhắc xử lý duplicate email ở mức DB/error mapping.
- Chưa có auth token/JWT; sign-in chỉ trả user object.

## 10) Hướng mở rộng đề xuất
1. Thêm JWT access/refresh token cho sign-in.
2. Thêm unique index handling rõ hơn cho email khi update.
3. Đồng bộ nơi orchestration tạo cart (gateway hay user-service) để tránh trùng trách nhiệm.
4. Bổ sung audit fields hoặc lastLoginAt.
