# Architecture Overview - E-Commerce Microservices Platform

Tài liệu này mô tả kiến trúc tổng thể của hệ thống E-Commerce microservices, luồng dữ liệu, và cách các service tương tác.

---

## 1. Sơ đồ kiến trúc tổng thể

```
┌──────────────────────────────────────────────────────────────┐
│                    CLIENT / Browser                          │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP
                       ▼
┌──────────────────────────────────────────────────────────────┐
│         nginx-public:80 (Public Entry Point)                │
│  • Rate limit: 10 req/s per IP                              │
│  • Security headers (CORS, X-Frame, X-Content-Type)        │
│  • Rewrite: /users/* → /api-gateway/users/*                │
│  • Rewrite: /shopping-carts/* → /api-gateway/shopping-carts│
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│    api-gateway-service:3000 (Orchestration Layer)           │
│  • Validate requests (ValidationPipe)                       │
│  • Route to internal services                               │
│  • Orchestrate cross-service flows                          │
└──────────────────────┬───────────────────────────────────────┘
                       │ Internal HTTP (via NGINX_PRIVATE_HTTP_URL)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│      nginx-private:8080 (Internal Service Router)           │
│  • /api/users/* → user-service:3003                         │
│  • /api/shopping-carts/* → shopping-cart-service:3002       │
│  • /api/product-catalog/* → product-catalog-service:3004    │
└────┬──────────────────┬──────────────────────┬──────────────┘
     │                  │                      │
     ▼                  ▼                      ▼
 user-svc:3003    shopping-cart:3002    product-catalog:3004
 MongoDB           MongoDB                PostgreSQL
```

---

## 2. Các tầng kiến trúc chi tiết

### 2.1 Edge Layer: nginx-public

**Port:** 80
**Chức năng:**
- Single entry point cho tất cả public traffic
- Rate limiting, security headers
- Path rewriting từ friendly URLs sang gateway endpoints

**Cấu hình:**
```nginx
# Rate limit
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20;

# Upstream
upstream api_gateway_service {
  server api-gateway-service:3000;
}

# Rewrite rules
location /users/ {
  rewrite ^/users/(.*)$ /api-gateway/users/$1 break;
  proxy_pass http://api_gateway_service;
}

location /shopping-carts/ {
  rewrite ^/shopping-carts/(.*)$ /api-gateway/shopping-carts/$1 break;
  proxy_pass http://api_gateway_service;
}
```

---

### 2.2 Gateway Layer: api-gateway-service

**Port:** 3000
**Mục đích:** Orchestrate requests giữa multiple internal services

**Cấu trúc code:**
```
api-gateway-service/src/
├── main.ts                          # Bootstrap + ValidationPipe
├── app.module.ts                    # Import modules
├── api-gateway/
│   ├── api-gateway.controller.ts    # Định nghĩa routes
│   ├── api-gateway.service.ts       # Orchestration logic
│   └── dto/
│       ├── create-user.dto.ts
│       └── ...
└── internal-svc/
    ├── internal-svc.service.ts      # HTTP client nội bộ
    └── dto/
```

**Pattern:**
```
Controller (thin) 
  ↓ calls
Service (orchestration) 
  ↓ calls
InternalSVCService (HTTP to nginx-private) 
  ↓
nginx-private 
  ↓
downstream service
```

**Ví dụ orchestration:**
```typescript
// User sign-up orchestrates 2 services:
1. Create user in user-service
2. Create empty cart in shopping-cart-service
3. Return combined response to client
```

---

### 2.3 Service Mesh Layer: nginx-private

**Port:** 8080
**Chức năng:** Internal service-to-service routing, hide topology

**Upstreams:**
```nginx
upstream user_service {
  server user-service:3003;
}

upstream shopping_cart_service {
  server shopping-cart-service:3002;
}

upstream product_catalog_service {
  server product-catalog-service:3004;
}
```

**Routing:**
```nginx
location /api/users/ {
  proxy_pass http://user_service;
}

location /api/shopping-carts/ {
  proxy_pass http://shopping_cart_service;
}

location /api/product-catalog/ {
  proxy_pass http://product_catalog_service;
}
```

**Lợi ích:**
- Gateway không cần biết service địa chỉ thực
- Có thể thay đổi port/hostname mà không update code
- Centralized timeout, retry logic

---

### 2.4 Microservices

#### **User Service (Port 3003, MongoDB)**

**Endpoints:**
```
GET  /api/users/health              # Health check
POST /api/users/sign-up             # Register user
POST /api/users/sign-in             # Login
GET  /api/users/:id                 # Get profile
PATCH /api/users/:id                # Update profile
DELETE /api/users/:id               # Delete account
```

**Data Model:**
```typescript
User {
  _id: ObjectId
  email: string (unique, required)
  hashedPassword: string (bcrypt)
  name?: string
  address?: string
  phoneNumber?: string
  createdAt: Date
  updatedAt: Date
}
```

**Key Logic:**
- Password hashed with bcrypt (salt=10)
- Response transforms to SafeUser (no password)
- Email conflict check → ConflictException
- Validate ObjectId before query

---

#### **Shopping Cart Service (Port 3002, MongoDB)**

**Endpoints:**
```
GET  /api/shopping-carts/health           # Health check
POST /api/shopping-carts                  # Create cart
POST /api/shopping-carts/items            # Add/update item
GET  /api/shopping-carts/user/:userId     # Get user's cart
PUT  /api/shopping-carts/user/:userId     # Replace items
DELETE /api/shopping-carts/user/:userId   # Delete cart
```

**Data Model:**
```typescript
ShoppingCart {
  _id: ObjectId
  userId: ObjectId (unique, 1 user = 1 cart)
  items: [
    { productId: ObjectId, quantity: number }
  ]
  createdAt: Date
  updatedAt: Date
}
```

**Key Logic:**
- Idempotent create (return existing if found)
- Add item: merge if productId exists, else push new
- Update: replace entire items array
- Potential race condition on concurrent adds (future fix)

---

#### **Product Catalog Service (Port 3004, PostgreSQL)**

**Endpoints:**
```
# Categories
POST /api/product-catalog/categories
GET /api/product-catalog/categories
GET /api/product-catalog/categories/:id
PATCH /api/product-catalog/categories/:id
DELETE /api/product-catalog/categories/:id

# Products
POST /api/product-catalog/products
GET /api/product-catalog/products
GET /api/product-catalog/products/:id
PATCH /api/product-catalog/products/:id
DELETE /api/product-catalog/products/:id
```

**Data Models:**
```typescript
Category {
  id: UUID (PK)
  name: varchar(150) (unique)
  description?: text
  createdAt: Date
  updatedAt: Date
}

Product {
  id: UUID (PK)
  name: varchar(200)
  sku: varchar(120) (unique)
  description?: text
  price: decimal(12,2)
  stockQuantity: int
  isActive: boolean
  categoryId: UUID (FK, onDelete: RESTRICT)
  createdAt: Date
  updatedAt: Date
}
```

**Trạng thái:** Chưa integrate vào gateway trong root docker-compose

---

#### **Notification Service (Port 3005, Skeleton)**

**Trạng thái:** Scaffold mặc định NestJS
**Hướng mở rộng:**
- Event-driven (Kafka/RabbitMQ)
- Email/SMS/Push channels
- Idempotency & retry

---

## 3. Luồng dữ liệu chính

### 3.1 User Sign-Up Flow

```
Client: POST /users/sign-up
        { email, password, name }
           │
           ▼
nginx-public (rewrite to /api-gateway/users/sign-up)
           │
           ▼
api-gateway validates DTO
           │
           ├─→ Call: POST /api/users/sign-up via nginx-private
           │           └─→ user-service creates user
           │
           ├─→ Call: POST /api/shopping-carts via nginx-private
           │           └─→ shopping-cart-service creates cart
           │
           └─→ Combine response
                   │
                   ▼
Response: { user: {...}, cart: {...} }
```

### 3.2 Add Item to Cart Flow

```
Client: POST /shopping-carts/items
        { userId, productId, quantity }
           │
           ▼
nginx-public
           │
           ▼
api-gateway
           │
           ▼
nginx-private → shopping-cart-service
           │
           ▼
Logic:
  1. Find cart by userId
  2. If item exists: increment quantity
  3. Else: push new item
  4. Save to MongoDB
           │
           ▼
Response: { items: [...], updatedAt: ... }
```

---

## 4. Database Architecture

### 4.1 MongoDB (user-service, shopping-cart-service)

**Ưu điểm:**
- Schema flexible
- Tốc độ write cao
- Dễ scale horizontally (sharding)

**Nhược điểm:**
- Không có transaction (version cũ)
- Race condition risk khi concurrent updates
- Không có foreign key constraints

---

### 4.2 PostgreSQL (product-catalog-service)

**Ưu điểm:**
- ACID transactions
- Referential integrity
- Complex queries
- Strong consistency

**Nhược điểm:**
- Schema rigid
- Cần migration

---

## 5. Communication Patterns

### 5.1 Client → Gateway (Public)

```
POST http://localhost/users/sign-up
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response (201):
{
  "id": "507f...",
  "email": "user@example.com",
  "createdAt": "2024-01-01T..."
}

Response (409 Conflict):
{
  "statusCode": 409,
  "message": "Email already exists"
}
```

### 5.2 Gateway → Internal (Private)

**Configuration:**
```
NGINX_PRIVATE_HTTP_URL=http://nginx-private:8080
```

**Pattern:**
```typescript
async createUser(dto: CreateUserDto) {
  const response = await this.httpService.post(
    `${NGINX_PRIVATE_HTTP_URL}/api/users/sign-up`,
    dto
  );
  return response.data;
}
```

**Error Handling:**
- Preserve downstream status code
- Transform error messages
- Throw HttpException

---

## 6. Environment Configuration

### Per-Service Variables

**Common:**
```
PORT=3000
NODE_ENV=development
NGINX_PRIVATE_HTTP_URL=http://nginx-private:8080
```

**user-service:**
```
MONGODB_URI=mongodb://mongodb:27017/users
```

**shopping-cart-service:**
```
MONGODB_URI=mongodb://mongodb:27017/shopping-cart
```

**product-catalog-service:**
```
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=product_catalog
DATABASE_SYNC=true
```

---

## 7. Key Design Decisions

### 7.1 Why Gateway Pattern?

✅ Centralized validation
✅ Single orchestration point
✅ Easy to add cross-service logic
✅ Consistent error handling
❌ Single point of failure (mitigate with replicas)

### 7.2 Why Separate nginx Layers?

✅ Public layer protects internal topology
✅ Easy to change internal routing
✅ Rate limit at edge
❌ Extra latency (minimal)

### 7.3 Why Multiple Databases?

✅ Scale independently
✅ Choose best tool (SQL vs NoSQL)
✅ Avoid coupling
❌ Distributed transaction complexity

### 7.4 Why No Authentication Token Yet?

Current state: Simple email/password
Future: Add JWT
- AccessToken (15 min expiry)
- RefreshToken (7 days)
- Store in gateway or client

---

## 8. Current Limitations

| Issue | Impact | Priority |
|-------|--------|----------|
| No JWT auth | Can't verify user identity | High |
| Race condition in cart | Concurrent adds broken | High |
| No transactions | Data consistency risk | Medium |
| No pagination | Performance issue | Medium |
| Notification skeleton | Can't send notifications | Low |
| No service discovery | Manual config | Low |

---

## 9. Adding New Features Checklist

### When Adding a New Endpoint:

```
1. Service Layer (user-service, shopping-cart, etc)
   ├─ Add/update DTO (request + response)
   ├─ Add service method with business logic
   ├─ Add controller method
   └─ Update schema/entity if needed

2. nginx-private
   ├─ Add upstream if new service
   └─ Add location if new path

3. api-gateway (if public endpoint)
   ├─ Add InternalSVCService method
   ├─ Add ApiGatewayService method
   └─ Add ApiGatewayController route

4. nginx-public
   ├─ Add rewrite rule
   └─ Test health endpoint

5. Documentation
   └─ Update ai-service-context files
```

### When Changing a Route:

```
1. Service: Update controller.ts
2. nginx-private: Update location if path changed
3. api-gateway: Update internal-svc.service.ts
4. nginx-public: Update rewrite rule
5. Test: Verify via public and private paths
```

---

## 10. Deployment Strategy

### Development (docker-compose.dev.yml):
```
Services: nginx-public, api-gateway, nginx-private,
          user-service, shopping-cart-service
Databases: MongoDB, PostgreSQL
Network: Docker bridge (vuhieu-network)
```

### Production (Future):
```
Proposed:
- Kubernetes cluster
- Managed load balancer
- Database replicas
- Service mesh (Istio)
- Monitoring (Prometheus)
- Logging (ELK)
```

---

## 11. Troubleshooting

### 404 Errors:
```
Check:
1. Rewrite rule in nginx-public correct?
2. Upstream defined in nginx-private?
3. Route in service controller?
4. Service running? (docker ps, health check)
```

### 500 Errors:
```
Check:
1. Service logs: docker logs <service>
2. Database accessible?
3. Environment variables set?
4. Downstream service available?
```

### Validation Errors:
```
Check:
1. DTO has decorators? (@IsEmail, @IsNotEmpty)
2. ValidationPipe enabled? (main.ts)
3. Error message clear?
4. Field is optional? (use ?)
```

---

## 12. References

- **Coding Standards**: [CODING_STANDARDS.md](./CODING_STANDARDS.md)
- **Copilot Rules**: [copilot-instructions.md](./copilot-instructions.md)
- **Service Docs**: `./ai-service-context/`
  - api-gateway-service.md
  - user-service.md
  - shopping-cart-service.md
  - product-catalog-service.md
  - notification-service.md
  - nginx-folder.md
