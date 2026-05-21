# =========================================================
# Giai đoạn 1: Base - Cài đặt pnpm và cấu hình môi trường
# =========================================================
FROM node:22-alpine AS base

RUN npm install -g pnpm
WORKDIR /app

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN pnpm config set store-dir /pnpm/store

# =========================================================
# Giai đoạn 2: Dependencies - Cài đặt và cấp quyền build
# =========================================================
FROM base AS dependencies

COPY package.json pnpm-lock.yaml ./

# Cách 1: Cho phép các package cụ thể (Giống file dev của bạn nhưng tự động hóa)
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm approve-builds @nestjs/core unrs-resolver
RUN pnpm install --frozen-lockfile

# CÁCH 2 (KHUYÊN DÙNG CHO PROD): Nếu cách 1 vẫn lỗi do thiếu package khác, 
# bạn có thể dùng cờ --no-frozen-lockfile kết hợp ignore-scripts=false khi cần, 
# hoặc chạy lệnh dưới đây để bỏ qua lớp bảo mật build của pnpm trong môi trường Docker:
# RUN pnpm config set ignore-scripts false && pnpm install --frozen-lockfile

# =========================================================
# Giai đoạn 3: Build - Biên dịch mã nguồn (TS -> JS)
# =========================================================
FROM base AS build

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# Lọc bỏ devDependencies, giữ lại prod dependencies và cho phép chúng chạy script nếu cần
RUN pnpm prune --prod --no-optional

# =========================================================
# Giai đoạn 4: Production - Image cuối cùng cực kỳ nhẹ
# =========================================================
FROM node:22-alpine AS production

ARG SHOPPING_CART_PORT=3000
ARG NGINX_PRIVATE_HTTP_URL=http://nginx-private:8080
ARG NODE_ENV=production

ENV PORT=$SHOPPING_CART_PORT
ENV NGINX_PRIVATE_HTTP_URL=$NGINX_PRIVATE_HTTP_URL
ENV NODE_ENV=$NODE_ENV

WORKDIR /app

# Bảo mật: Sử dụng user 'node'
USER node

# Copy kết quả đã build từ Giai đoạn 3
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/package.json ./package.json

EXPOSE $PORT

CMD ["node", "dist/main.js"]
