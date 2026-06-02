# Shopping Cart Service - AI Context

## 1) Mục đích dịch vụ
- Quản lý giỏ hàng theo user.
- Lưu dữ liệu cart và item bằng MongoDB.
- Cung cấp API nội bộ cho gateway/user-service qua nginx-private.

## 2) Stack kỹ thuật
- NestJS 11, TypeScript
- MongoDB + Mongoose
- class-validator + class-transformer
- ValidationPipe global ở main.ts

## 3) Cấu trúc code chính
- src/main.ts: bootstrap + validation + PORT (default 3002)
- src/app.module.ts:
  - ConfigModule global
  - MongooseModule.forRoot(MONGODB_URI)
  - import ShoppingCartsModule
- src/shopping-carts/*:
  - shopping-carts.controller.ts
  - shopping-carts.service.ts
  - dto/*
  - schemas/shopping-cart.schema.ts
- src/internal-svc/*: module/service đã có skeleton HTTP client, hiện chưa dùng nghiệp vụ thật.

## 4) Schema dữ liệu
ShoppingCart:
- userId: ObjectId, required
- items: mảng ShoppingCartItem
- timestamps: createdAt, updatedAt

ShoppingCartItem:
- productId: ObjectId, required
- quantity: number, required

## 5) Endpoint hiện có
Base path: /api/shopping-carts
- GET /health
- POST /
- POST /items
- GET /user/:userId
- PUT /user/:userId
- DELETE /user/:userId

## 6) Hành vi nghiệp vụ
- createShoppingCart:
  - Nếu user đã có cart thì trả cart cũ (idempotent theo userId).
  - Nếu chưa có thì tạo cart rỗng.
- addNewShoppingCart:
  - Nếu chưa có cart thì tạo mới với item đầu tiên.
  - Nếu đã có cart:
    - Nếu productId đã tồn tại: cộng quantity.
    - Nếu chưa tồn tại: push item mới.
- updateShoppingCartByUserId:
  - Ghi đè toàn bộ mảng items theo payload.
- removeShoppingCartByUserId:
  - Xóa cart theo userId.

## 7) Cách code và pattern
- Controller giữ mỏng, gọi thẳng service.
- Service làm việc trực tiếp với Mongoose Model.
- Không throw lỗi NotFound khi thiếu cart ở một số path; trả null theo kết quả query.
- DTO validate định dạng MongoId cho userId/productId.

## 8) Environment và vận hành
Biến môi trường chính:
- PORT (default 3002)
- MONGODB_URI (default mongodb://localhost:27017/shopping-cart)
- NGINX_PRIVATE_HTTP_URL

Docker:
- Có cả docker-compose.dev.yml (watch mode) và docker-compose.yml (prod image).
- service name nội bộ thường là shopping-cart-service (nginx-private upstream dùng tên này).

## 9) Rủi ro và điểm cần lưu ý cho AI
- update đang là replace toàn bộ items, không patch từng item.
- Chưa có transaction hay optimistic lock, có thể có race condition khi add item song song.
- Chưa có rule validate quantity > 0 ở DTO (hiện chỉ kiểm tra not empty).

## 10) Hướng mở rộng đề xuất
1. Tách command cho add/update/remove item riêng để tránh replace toàn bộ list.
2. Thêm index cho userId để truy vấn nhanh và đảm bảo uniqueness logic mức DB.
3. Thêm endpoint clear cart và remove single item.
4. Thêm test concurrent update để bắt lỗi race condition.
