# Product Catalog Service - AI Context

## 1) Mục đích dịch vụ
- Quản lý danh mục sản phẩm (category) và sản phẩm (product).
- Cung cấp CRUD cho catalog dùng PostgreSQL.
- Là service độc lập với shopping-cart/user (hiện chưa đi qua gateway trong docker-compose.dev root).

## 2) Stack kỹ thuật
- NestJS 11, TypeScript
- TypeORM + PostgreSQL
- class-validator + class-transformer
- ValidationPipe global ở main.ts

## 3) Cấu trúc code chính
- src/main.ts: bootstrap + validation + PORT (default 3004)
- src/app.module.ts:
  - ConfigModule global
  - TypeOrmModule.forRoot(autoLoadEntities)
  - import ProductCatalogModule
- src/product-catalog/*:
  - product-catalog.controller.ts
  - product-catalog.service.ts
  - dto/*
  - entities/category.entity.ts
  - entities/product.entity.ts

## 4) Mô hình dữ liệu
Category (table categories):
- id: uuid (PK)
- name: varchar(150), unique index
- description: text nullable
- createdAt, updatedAt

Product (table products):
- id: uuid (PK)
- name: varchar(200)
- sku: varchar(120), unique index
- description: text nullable
- price: decimal(12,2)
- stockQuantity: int
- isActive: boolean
- categoryId: uuid (FK -> categories.id)
- relation ManyToOne category (onDelete: RESTRICT)
- createdAt, updatedAt

## 5) Endpoint hiện có
Base path: /api/product-catalog

Health:
- GET /health

Category:
- POST /categories
- GET /categories
- GET /categories/:id
- PATCH /categories/:id
- DELETE /categories/:id

Product:
- POST /products
- GET /products
- GET /products/:id
- PATCH /products/:id
- DELETE /products/:id

## 6) Hành vi nghiệp vụ
- create/update product kiểm tra category tồn tại trước, nếu không có -> BadRequestException.
- findById (product/category) nếu thiếu -> NotFoundException.
- findProducts trả kèm relation category và sắp xếp createdAt DESC.
- findCategories sắp xếp name ASC.

## 7) Cách code và pattern
- Controller đơn giản, hầu hết logic ở service.
- Service dùng repository pattern của TypeORM.
- Dùng Object.assign để merge dữ liệu update.
- DTO update dùng PartialType từ @nestjs/mapped-types.

## 8) Environment và vận hành
Biến môi trường chính:
- PORT (default 3004)
- DATABASE_HOST (default localhost)
- DATABASE_PORT (default 5432)
- DATABASE_USERNAME (default postgres)
- DATABASE_PASSWORD (default postgres)
- DATABASE_NAME (default product_catalog)
- DATABASE_SYNC (true/false)

Docker:
- docker-compose.dev.yml của riêng service có postgres container product-catalog-postgres.
- service chạy watch mode qua pnpm filter.

## 9) Rủi ro và điểm cần lưu ý cho AI
- package.json đang ghi typeorm version 1.0.0 (khác version phổ biến 0.3.x), cần kiểm tra lockfile/runtime khi nâng cấp.
- synchronize phụ thuộc env; tránh bật true ở production.
- delete category có thể thất bại nếu còn product do onDelete RESTRICT.

## 10) Hướng mở rộng đề xuất
1. Thêm phân trang/filter/search cho list products.
2. Thêm soft delete cho product/category.
3. Thêm migration thay vì phụ thuộc synchronize.
4. Thêm unique business validation cho tên category nếu cần đa ngôn ngữ.
