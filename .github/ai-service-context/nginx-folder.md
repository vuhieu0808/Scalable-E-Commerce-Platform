# Nginx Folder - AI Context

## 1) Mục đích tổng thể
Thư mục nginx đang tách 2 lớp reverse proxy:
- nginx-public: cổng public cho client bên ngoài.
- nginx-private: cổng nội bộ để route giữa các service backend.

Mục tiêu:
- Che giấu topology nội bộ.
- Tách concern public routing và service-to-service routing.
- Áp dụng security header/rate limit/CORS ở lớp edge.

## 2) Thành phần chính
- nginx/docker-compose.dev.yml: chạy cả nginx-public và nginx-private trên network vuhieu-network.
- nginx/nginx-public/nginx-public.conf: route public -> api-gateway-service.
- nginx/nginx-private/nginx-private.conf: route nội bộ -> user-service/shopping-cart-service.
- nginx/nginx-public/Dockerfile.dev, nginx/nginx-private/Dockerfile.dev: build image dev từ nginx:alpine.

## 3) nginx-public: trách nhiệm và route
Lắng nghe:
- port 80

Upstream:
- api_gateway_service -> api-gateway-service:3000

Route chính:
- /shopping-carts/*
  - rewrite sang /api-gateway/shopping-carts/*
  - proxy_pass tới api_gateway_service
- /users/*
  - rewrite sang /api-gateway/users/*
  - proxy_pass tới api_gateway_service

Tính năng bảo vệ:
- rate limit: 10 request/giây/IP (burst 20)
- security headers: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- gzip bật cho một số content type
- CORS headers cho các route public

## 4) nginx-private: trách nhiệm và route
Lắng nghe:
- port 8080

Upstream:
- shopping_cart_service -> shopping-cart-service:3002
- user_service -> user-service:3003

Route nội bộ:
- /api/users/ -> user_service
- /api/shopping-carts/ -> shopping_cart_service
- / -> trả 404

Đặc điểm:
- giữ nguyên URI gốc khi proxy_pass không có slash ở cuối upstream URL.
- có timeout connect/read/send riêng cho upstream.

## 5) Cách code/cấu hình đáng chú ý
- public layer dùng rewrite để map URL thân thiện cho client về namespace gateway.
- private layer dùng prefix-based routing cho service nội bộ.
- cả 2 layer đều set X-Forwarded-* để service biết thông tin request gốc.

## 6) Liên kết với docker-compose root
- docker-compose.dev.yml ở root đang include nginx, api-gateway, shopping-cart, user.
- product-catalog hiện có compose dev riêng nhưng chưa include vào root compose.

## 7) Rủi ro và điểm AI cần cẩn trọng
- Nếu đổi route ở gateway/service mà quên update rewrite/location sẽ gây 404.
- CORS hiện để *, cần siết domain thật khi lên production.
- Cần kiểm tra kỹ hành vi trailing slash trong location/proxy_pass để tránh mismatch.
- Nếu thêm service mới, phải cập nhật đồng bộ:
  - upstream + location ở nginx-private
  - route/rewrite ở nginx-public (nếu public)
  - compose depends_on và network

## 8) Checklist khi thêm service mới qua nginx
1. Tạo upstream trong nginx-private.
2. Tạo location /api/<service-prefix>/ ở nginx-private.
3. Nếu public, thêm location ở nginx-public và rewrite về gateway hoặc service đích.
4. Bổ sung timeout/header cần thiết.
5. Reload nginx và test health endpoint cho cả public + private path.
