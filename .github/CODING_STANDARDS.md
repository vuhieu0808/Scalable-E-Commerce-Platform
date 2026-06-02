# Coding Standards - E-Commerce Microservices

Tài liệu này quy định các chuẩn mực code cho toàn bộ dự án E-Commerce microservices.

---

## 1. Naming Conventions

### 1.1 Files & Directories
```
✅ Đúng:
- user.controller.ts
- shopping-cart.service.ts
- create-user.dto.ts
- user.schema.ts / user.entity.ts

❌ Sai:
- UserController.ts
- shoppingCartService.ts
- CreateUserDTO.ts
```

**Quy tắc:**
- File: `kebab-case` + suffix rõ ràng (`.controller`, `.service`, `.dto`, `.schema`, `.entity`)
- Thư mục: `kebab-case` (vd: `shopping-carts`, `internal-svc`)

### 1.2 Classes & Interfaces
```typescript
✅ Đúng:
export class CreateUserDto { }
export class UserService { }
export interface SafeUser { }
export class UserSchema { }

❌ Sai:
export class createUserDTO { }
export class userService { }
```

**Quy tắc:**
- Classes: `PascalCase`
- Interfaces: `PascalCase` (không prefix `I`)
- DTOs: suffix `Dto` (không viết hoa toàn bộ)

### 1.3 Variables & Functions
```typescript
✅ Đúng:
const userId = '123';
const hashedPassword = await bcrypt.hash(password, 10);
async function createShoppingCart(userId: string) { }
private toSafeUser(user: User): SafeUser { }

❌ Sai:
const UserID = '123';
const hashed_password = await bcrypt.hash(password, 10);
```

**Quy tắc:**
- Variables, functions, methods: `camelCase`
- Constants: `UPPER_SNAKE_CASE` (chỉ cho giá trị thực sự immutable)
- Private methods: vẫn dùng `camelCase`

### 1.4 Environment Variables
```
✅ Đúng:
PORT=3000
MONGODB_URI=mongodb://localhost:27017/users
DATABASE_HOST=localhost
NGINX_PRIVATE_HTTP_URL=http://nginx-private:8080

❌ Sai:
port=3000
mongodbUri=mongodb://localhost:27017/users
database-host=localhost
```

**Quy tắc:** `UPPER_SNAKE_CASE`

---

## 2. Project Structure Patterns

### 2.1 Service Structure (Chuẩn NestJS)
```
service-name/
├── src/
│   ├── main.ts                    # Bootstrap + ValidationPipe
│   ├── app.module.ts              # Root module
│   ├── <domain>/                  # Domain module (users, shopping-carts, etc.)
│   │   ├── <domain>.module.ts
│   │   ├── <domain>.controller.ts
│   │   ├── <domain>.service.ts
│   │   ├── dto/
│   │   │   ├── create-<entity>.dto.ts
│   │   │   ├── update-<entity>.dto.ts
│   │   │   └── <entity>-response.dto.ts
│   │   ├── schemas/               # Cho MongoDB
│   │   │   └── <entity>.schema.ts
│   │   └── entities/              # Cho TypeORM
│   │       └── <entity>.entity.ts
│   └── internal-svc/              # HTTP client nội bộ
│       ├── internal-svc.module.ts
│       ├── internal-svc.service.ts
│       └── dto/
├── .env.example
├── Dockerfile.dev
└── docker-compose.dev.yml
```

### 2.2 Module Responsibilities
- **Controller**: Chỉ nhận request, validate DTO, gọi service, trả response
- **Service**: Business logic, database operations, orchestration
- **DTO**: Validation rules + typing cho request/response
- **Schema/Entity**: Database model definition
- **Internal-SVC**: HTTP client cho cross-service communication

---

## 3. DTO & Validation Patterns

### 3.1 Request DTO
```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsString()
  name?: string; // Optional field
}
```

**Quy tắc:**
- Mỗi field phải có validation decorator rõ ràng
- Message lỗi phải human-readable
- Optional fields: dùng `?` type modifier
- Không validate trong controller, để ValidationPipe tự động xử lý

### 3.2 Response DTO
```typescript
export class UserResponseDto {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  
  // ❌ KHÔNG BAO GIỜ trả về:
  // hashedPassword: string;
  // resetToken: string;
}
```

**Quy tắc:**
- Chỉ expose fields cần thiết cho client
- Dùng helper function để transform (vd: `toSafeUser()`)
- Không lộ thông tin nhạy cảm: password, token, internal IDs

### 3.3 Update DTO Pattern
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Tất cả fields từ CreateUserDto thành optional
  // Có thể thêm fields riêng nếu cần
}
```

---

## 4. Error Handling Standards

### 4.1 HTTP Exception Mapping
```typescript
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

// Conflict - Dữ liệu đã tồn tại
if (existingUser) {
  throw new ConflictException('Email already exists');
}

// NotFound - Không tìm thấy resource
if (!user) {
  throw new NotFoundException('User not found');
}

// Unauthorized - Authentication/password sai
if (!isPasswordValid) {
  throw new UnauthorizedException('Invalid email or password');
}

// BadRequest - Input không hợp lệ (ngoài validation DTO)
if (!Types.ObjectId.isValid(id)) {
  throw new BadRequestException('Invalid user ID format');
}
```

### 4.2 Internal Service Error Handling
```typescript
// Trong InternalSVCService
try {
  const response = await this.httpService.axiosRef.request(config);
  
  if (!response.data) {
    throw new BadGatewayException('Empty response from internal service');
  }
  
  return response.data;
} catch (error) {
  if (error.response) {
    // Giữ nguyên status code từ downstream service
    throw new HttpException(
      error.response.data,
      error.response.status,
    );
  }
  throw new BadGatewayException('Internal service unavailable');
}
```

**Quy tắc:**
- Luôn throw exception rõ ràng, không return null/undefined
- Preserve status code từ downstream service
- Log error trước khi throw (cho debugging)

---

## 5. Database Patterns

### 5.1 MongoDB Schema (Mongoose)
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  hashedPassword: string;

  @Prop()
  name?: string;

  // Timestamps tự động: createdAt, updatedAt
}

export const UserSchema = SchemaFactory.createForClass(User);

// Thêm index nếu cần
UserSchema.index({ email: 1 }, { unique: true });
```

**Quy tắc:**
- Bật `timestamps: true` cho tất cả schema
- Dùng `@Prop()` decorator rõ ràng
- Định nghĩa unique constraint ở schema level
- Tạo index cho fields thường query

### 5.2 PostgreSQL Entity (TypeORM)
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 120, unique: true })
  sku: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

**Quy tắc:**
- Dùng UUID cho PK (không dùng auto-increment)
- Explicit column names cho snake_case DB
- Luôn có `CreateDateColumn` và `UpdateDateColumn`
- Foreign key phải có `onDelete` behavior rõ ràng

---

## 6. Security Practices

### 6.1 Password Handling
```typescript
import * as bcrypt from 'bcrypt';

// Hash password trước khi lưu
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

// Verify password
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

**Quy tắc:**
- KHÔNG BAO GIỜ lưu plain password
- Salt rounds ≥ 10
- Dùng bcrypt, không dùng crypto.createHash()

### 6.2 Sensitive Data
```typescript
// ✅ Đúng: Transform trước khi trả về
function toSafeUser(user: User): SafeUser {
  const { hashedPassword, resetToken, ...safeUser } = user.toObject();
  return safeUser;
}

// ❌ Sai: Trả về toàn bộ document
return user; // Có thể lộ hashedPassword
```

### 6.3 Environment Variables
```typescript
// ❌ KHÔNG hardcode
const dbPassword = 'my-secret-password';

// ✅ Dùng environment variables
const dbPassword = process.env.DATABASE_PASSWORD;

// ✅ Có fallback cho development
const port = parseInt(process.env.PORT, 10) || 3000;
```

---

## 7. API Design Standards

### 7.1 RESTful Route Naming
```
✅ Đúng:
POST   /api/users                    # Create
GET    /api/users                    # List
GET    /api/users/:id                # Get one
PATCH  /api/users/:id                # Partial update
DELETE /api/users/:id                # Delete
POST   /api/users/sign-in            # Action-based (exception)

❌ Sai:
POST   /api/createUser
GET    /api/getUserById/:id
POST   /api/users/:id/update
```

**Quy tắc:**
- Base path: `/api/<resource-plural>`
- Dùng HTTP methods đúng nghĩa
- Actions đặc biệt (sign-in, sign-up): dùng POST với verb path

### 7.2 Response Format
```typescript
// ✅ Success response (2xx)
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}

// ✅ Error response (4xx, 5xx)
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}

// ❌ Không wrap trong { success: true, data: {...} }
```

---

## 8. Cross-Service Communication

### 8.1 Internal HTTP Call Pattern
```typescript
// Trong InternalSVCService
async createShoppingCart(userId: string) {
  return this.request<ShoppingCartResponseDto>({
    method: 'POST',
    url: `${this.internalBaseUrl}/api/shopping-carts`,
    data: { userId },
  });
}
```

**Quy tắc:**
- Luôn gọi qua `nginx-private` (không gọi trực tiếp service:port)
- Base URL: `NGINX_PRIVATE_HTTP_URL` từ env
- Path: `/api/<service-prefix>/...`
- Typing rõ ràng với generic `<ResponseType>`

### 8.2 Routing Cascade
Khi thêm/sửa endpoint cross-service, cập nhật theo thứ tự:

1. **Service gốc** (user-service, shopping-cart-service)
   - Controller + Service + DTO

2. **nginx-private** config
   - Upstream definition
   - Location mapping

3. **api-gateway-service** (nếu cần orchestration)
   - InternalSVCService method
   - ApiGatewayService method
   - ApiGatewayController endpoint

4. **nginx-public** config (nếu public route)
   - Rewrite rule
   - Location mapping

---

## 9. Code Documentation

### 9.1 Comments
```typescript
// ✅ Đúng: Comment giải thích WHY, không giải thích WHAT
// Hash password với bcrypt để bảo mật thay vì plain MD5
const hashedPassword = await bcrypt.hash(password, 10);

// Check email conflict trước vì DB unique constraint không có message rõ
if (existingUser) {
  throw new ConflictException('Email already exists');
}

// ❌ Sai: Comment trùng với code
// Hash password
const hashedPassword = await bcrypt.hash(password, 10);
```

**Quy tắc:**
- Chỉ comment khi logic không self-explanatory
- Giải thích lý do (why), không mô tả hành động (what)
- Không comment code cũ, xóa luôn

### 9.2 Service Documentation
Mỗi service phải có file trong `.github/ai-service-context/`:
- Mục đích service
- Endpoint list
- Database schema
- Environment variables
- Dependencies với service khác

---

## 10. Testing Guidelines

### 10.1 Test Structure (Khi có test)
```
src/
├── users/
│   ├── users.controller.spec.ts
│   ├── users.service.spec.ts
│   └── users.e2e-spec.ts
```

### 10.2 Test Coverage Priorities
1. **Critical path**: sign-up, sign-in, checkout flow
2. **Business logic**: cart calculation, inventory check
3. **Error cases**: invalid input, not found, conflict
4. **Integration**: cross-service orchestration

---

## 11. Git Commit Standards

### 11.1 Commit Message Format
```
feat: Add product search endpoint

- Implement search by name and category
- Add pagination support
- Update nginx-private routing

Related: #123
```

**Quy tắc:**
- Type: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`
- Subject: Imperative mood, lowercase, no period
- Body: Chi tiết thay đổi (optional)
- Footer: Reference issue/PR (optional)

### 11.2 Commit Scope
- 1 commit = 1 logical change
- Không mix refactor + feature trong 1 commit
- Cross-service changes: commit riêng cho mỗi service, hoặc atomic commit với note rõ ràng

---

## 12. Performance & Optimization

### 12.1 Database Query
```typescript
// ✅ Đúng: Chỉ select fields cần thiết
const users = await this.userModel
  .find()
  .select('email name createdAt')
  .limit(100);

// ✅ Đúng: Eager load relation khi cần
const products = await this.productRepo.find({
  relations: ['category'],
});

// ❌ Sai: N+1 query
for (const cart of carts) {
  const user = await this.userService.findById(cart.userId); // N queries
}
```

### 12.2 Caching Strategy (Future)
- Redis cho session/token
- Cache product catalog (TTL 5-10 phút)
- Không cache user-specific data như cart

---

## 13. Checklist cho Pull Request

Trước khi tạo PR, đảm bảo:

- [ ] Code pass lint (ESLint + Prettier)
- [ ] Không có console.log debug
- [ ] DTO có validation đầy đủ
- [ ] Error handling rõ ràng
- [ ] Không lộ sensitive data
- [ ] Cập nhật `.env.example` nếu thêm env var
- [ ] Cập nhật service context doc nếu behavior thay đổi
- [ ] Test manual qua Postman/curl
- [ ] Build service thành công
- [ ] Health endpoint vẫn hoạt động

---

## 14. Code Review Checklist

Khi review code, chú ý:

**Security:**
- [ ] Không hardcode secrets
- [ ] Password được hash đúng cách
- [ ] Input validation đầy đủ
- [ ] SQL injection / NoSQL injection prevention

**Architecture:**
- [ ] Controller mỏng, logic ở service
- [ ] DTO đồng bộ giữa caller/receiver
- [ ] Routing cascade đầy đủ (service → nginx-private → gateway → nginx-public)

**Code Quality:**
- [ ] Naming convention nhất quán
- [ ] Error handling đầy đủ
- [ ] Không duplicate code
- [ ] Comments hợp lý

**Testing:**
- [ ] Critical path có test coverage
- [ ] Edge cases được xử lý

---

## 15. Common Anti-Patterns (Tránh)

### ❌ Anti-pattern 1: Fat Controller
```typescript
// SAI: Business logic trong controller
@Post()
async create(@Body() dto: CreateUserDto) {
  const existingUser = await this.userModel.findOne({ email: dto.email });
  if (existingUser) throw new ConflictException();
  
  const hashedPassword = await bcrypt.hash(dto.password, 10);
  const user = await this.userModel.create({ ...dto, hashedPassword });
  
  // ... 50 dòng logic khác
}

// ĐÚNG: Ủy thác cho service
@Post()
async create(@Body() dto: CreateUserDto) {
  return this.userService.create(dto);
}
```

### ❌ Anti-pattern 2: Missing Validation
```typescript
// SAI: Validate bằng tay
if (!email || !email.includes('@')) {
  throw new BadRequestException('Invalid email');
}

// ĐÚNG: Dùng class-validator DTO
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
```

### ❌ Anti-pattern 3: Catch-all Try-Catch
```typescript
// SAI: Nuốt lỗi
try {
  await this.doSomething();
} catch (error) {
  console.log(error);
  return null; // ❌ Silent failure
}

// ĐÚNG: Re-throw hoặc xử lý cụ thể
try {
  await this.doSomething();
} catch (error) {
  this.logger.error('Failed to do something', error.stack);
  throw new InternalServerErrorException('Operation failed');
}
```

---

## Tài liệu tham khảo

- [NestJS Best Practices](https://docs.nestjs.com/techniques/configuration)
- [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [REST API Design Guidelines](https://restfulapi.net/)
- [OWASP Security Practices](https://owasp.org/www-project-top-ten/)
