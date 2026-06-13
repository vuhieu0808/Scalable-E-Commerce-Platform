CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE "public"."users" (
    "id" uuid NOT NULL,
    "email" varchar NOT NULL,
    "hashedPassword" varchar NOT NULL,
    "name" varchar,
    "phoneNumber" varchar,
    "createdAt" date,
    "updatedAt" date,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."shopping-cart-items" (
    "productId" uuid NOT NULL,
    "quantity" int,
    "createdAt" date,
    "updatedAt" date,
    PRIMARY KEY ("productId")
);

CREATE TABLE "public"."shopping-carts" (
    "userId" uuid NOT NULL UNIQUE,
    "items" uuid NOT NULL,
    "createdAt" date,
    "updatedAt" date
);

CREATE TABLE "public"."products" (
    "id" uuid NOT NULL,
    "name" varchar,
    "description" text,
    "price" money,
    "quantity" int,
    "categoryId" uuid,
    "createdAt" date,
    "updatedAt" date,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."categories" (
    "id" uuid NOT NULL,
    "name" varchar,
    "description" text,
    "products" uuid[],
    "createdAt" date,
    "updatedAt" date,
    PRIMARY KEY ("id")
);

-- Foreign key constraints
-- Schema: public
ALTER TABLE "public"."shopping-cart-items" ADD CONSTRAINT "fk_shopping_cart_items_productId_shopping_carts_items" FOREIGN KEY("productId") REFERENCES "public"."shopping-carts"("items");
ALTER TABLE "public"."shopping-carts" ADD CONSTRAINT "fk_shopping_carts_userId_users_id" FOREIGN KEY("userId") REFERENCES "public"."users"("id");
ALTER TABLE "public"."products" ADD CONSTRAINT "fk_products_id_categories_products" FOREIGN KEY("id") REFERENCES "public"."categories"("products");
ALTER TABLE "public"."products" ADD CONSTRAINT "fk_products_id_shopping_cart_items_productId" FOREIGN KEY("id") REFERENCES "public"."shopping-cart-items"("productId");
ALTER TABLE "public"."categories" ADD CONSTRAINT "fk_categories_id_products_categoryId" FOREIGN KEY("id") REFERENCES "public"."products"("categoryId");