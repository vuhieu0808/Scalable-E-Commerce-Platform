# Copilot Instructions

Mục tiêu của tài liệu này là quy định rõ AI phải làm gì trước khi sửa source code, và những hành vi cần tránh để giữ hệ thống ổn định.

## 📚 Tài liệu tham khảo

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Kiến trúc tổng thể, luồng dữ liệu, các tầng hệ thống (đọc trước)
- **[CODING_STANDARDS.md](./CODING_STANDARDS.md)** - Quy chuẩn chi tiết về naming, patterns, validation, security

## 1. Bắt buộc trước khi chỉnh sửa source code

1. Đọc nhanh tài liệu kiến trúc trước khi sửa:

- ./ai-service-context/api-gateway-service.md
- ./ai-service-context/shopping-cart-service.md
- ./ai-service-context/user-service.md
- ./ai-service-context/product-catalog-service.md
- ./ai-service-context/notification-service.md
- ./ai-service-context/nginx-folder.md

2. Xác định phạm vi thay đổi:

- Đổi 1 endpoint hay nhiều endpoint?
- Chỉ đổi trong 1 service hay cần đồng bộ gateway + nginx + service liên quan?
- Có ảnh hưởng DTO/schema/database không?

3. Kiểm tra ảnh hưởng routing:

- Nếu đổi route public: phải cập nhật rewrite trong nginx/nginx-public/nginx-public.conf.
- Nếu đổi route internal: phải cập nhật location/upstream trong nginx/nginx-private/nginx-private.conf.
- Nếu đổi đường dẫn gọi nội bộ từ gateway: cập nhật api-gateway-service/src/internal-svc/internal-svc.service.ts.

4. Kiểm tra hợp đồng dữ liệu:

- DTO request/response phải đồng bộ giữa controller, service và internal caller.
- Validate input bằng class-validator, không bỏ qua ValidationPipe.

5. Xác nhận biến môi trường liên quan:

- PORT
- NGINX_PRIVATE_HTTP_URL
- MONGODB_URI
- DATABASE\_\* (với product-catalog-service)

## 2. Nên làm

### 2.1 Kiến trúc & Design
- Giữ controller mỏng, đưa nghiệp vụ vào service.
- Thêm hoặc cập nhật DTO trước khi thêm endpoint mới.
- Giữ nhất quán convention đặt tên route hiện có.
- Xử lý lỗi rõ ràng bằng exception phù hợp (BadRequest, NotFound, Conflict, Unauthorized).
- Khi sửa luồng cross-service, phải cập nhật đồng bộ:
  - service gốc
  - api-gateway-service
  - nginx-private
  - nginx-public (nếu là route public)

### 2.2 Code Quality
- Tuân thủ naming conventions:
  - Files: `kebab-case` (vd: `user.controller.ts`)
  - Classes/Interfaces: `PascalCase` (vd: `CreateUserDto`)
  - Variables/Functions: `camelCase` (vd: `hashedPassword`)
  - Env vars: `UPPER_SNAKE_CASE` (vd: `DATABASE_HOST`)
- Validate input bằng class-validator decorators, không validate thủ công.
- Transform sensitive data trước khi trả về (dùng helper như `toSafeUser()`).
- Comment giải thích WHY (lý do), không giải thích WHAT (hành động).

### 2.3 Quy trình
- Ưu tiên thay đổi nhỏ, dễ review và dễ rollback.
- Ghi chú lý do kỹ thuật trong PR description hoặc changelog ngắn.
- Commit message theo format: `<type>: <subject>` (vd: `feat: Add user search`)

## 3. Không nên làm

### 3.1 Routing & Architecture
- Không sửa route mà bỏ qua cập nhật rewrite/location trong nginx.
- Không đưa business logic lớn vào controller (fat controller anti-pattern).
- Không gọi trực tiếp service:port, phải qua nginx-private.
- Không sửa nhiều service cùng lúc nếu không thực sự cần thiết.

### 3.2 Security
- Không trả về thông tin nhạy cảm (ví dụ hashedPassword, resetToken).
- Không hardcode secret, token, password trong source code.
- Không lưu plain password, phải hash bằng bcrypt (salt rounds ≥ 10).
- Không dùng crypto.createHash() cho password, chỉ dùng bcrypt.

### 3.3 Code Quality
- Không validate input thủ công, dùng class-validator DTO.
- Không catch error mà nuốt im (silent failure).
- Không để console.log trong production code.
- Không comment code cũ, xóa luôn.
- Không duplicate code, tách thành helper/utility.

### 3.4 API Stability
- Không đổi behavior API đang ổn định nếu chưa có yêu cầu rõ ràng.
- Không phá vỡ backward compatibility của payload khi chưa thông báo.
- Không wrap response trong `{ success: true, data: {...} }` (trả trực tiếp object).

## 4. Checklist trước khi kết thúc thay đổi

### 4.1 Code Quality
- [ ] Code pass lint (ESLint + Prettier).
- [ ] Không có console.log debug còn sót.
- [ ] DTO có validation đầy đủ với message rõ ràng.
- [ ] Error handling rõ ràng (throw exception phù hợp, không return null).
- [ ] Naming conventions nhất quán (kebab-case files, PascalCase classes, camelCase vars).

### 4.2 Security
- [ ] Không lộ dữ liệu nhạy cảm trong response.
- [ ] Password được hash đúng cách (bcrypt, salt ≥ 10).
- [ ] Không hardcode secrets/tokens.
- [ ] Input validation đầy đủ để chống injection.

### 4.3 Functionality
- [ ] Build/chạy được service bị sửa.
- [ ] Endpoint chính vẫn hoạt động (ít nhất health + endpoint vừa sửa).
- [ ] Nếu có đổi route, đã test được qua cả đường public (nginx-public) và đường internal (nginx-private).

### 4.4 Documentation
- [ ] Đã cập nhật tài liệu trong ai-service-context nếu behavior thay đổi.
- [ ] Cập nhật `.env.example` nếu thêm env var mới.
- [ ] Comments giải thích WHY cho logic phức tạp.

## 5. Quy tắc ưu tiên khi có xung đột

1. Tính đúng của nghiệp vụ và dữ liệu.
2. Tính ổn định của route và hợp đồng API.
3. Tính nhỏ gọn và khả năng bảo trì của thay đổi.
4. Tốc độ triển khai.

## 6. Nguyên tắc thao tác an toàn

- Ưu tiên patch nhỏ để dễ rollback.
- Không xóa file/cấu hình hệ thống khi chưa xác định rõ ảnh hưởng.
- Nếu phát hiện thay đổi bất thường ngoài phạm vi task, dừng lại và báo người dùng trước khi tiếp tục.
