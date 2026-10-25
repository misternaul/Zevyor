-- =============================================================================
-- ZEVYOR ECOMMERCE - SUPABASE / POSTGRESQL INITIAL SCHEMA
-- =============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Admin Passcodes
CREATE TABLE IF NOT EXISTS "AdminPasscode" (
    "id" TEXT PRIMARY KEY,
    "label" TEXT NOT NULL,
    "hashedPasscode" TEXT NOT NULL,
    "isOwner" BOOLEAN NOT NULL DEFAULT FALSE,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Admin Permissions
CREATE TABLE IF NOT EXISTS "AdminPermission" (
    "id" TEXT PRIMARY KEY,
    "passcodeId" TEXT NOT NULL REFERENCES "AdminPasscode"("id") ON DELETE CASCADE,
    "module" TEXT NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT FALSE,
    "canEdit" BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT "AdminPermission_passcodeId_module_key" UNIQUE ("passcodeId", "module")
);

-- 3. Admin Sessions
CREATE TABLE IF NOT EXISTS "AdminSession" (
    "id" TEXT PRIMARY KEY,
    "tokenHash" TEXT NOT NULL UNIQUE,
    "passcodeId" TEXT NOT NULL REFERENCES "AdminPasscode"("id") ON DELETE CASCADE,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Audit Logs
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT PRIMARY KEY,
    "passcodeId" TEXT REFERENCES "AdminPasscode"("id") ON DELETE SET NULL,
    "passcodeLabel" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "changeSummary" TEXT NOT NULL,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Categories
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "imageUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Products
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "shortDescription" TEXT,
    "fullDescription" TEXT,
    "categoryId" TEXT REFERENCES "Category"("id") ON DELETE SET NULL,
    "sku" TEXT,
    "tags" TEXT,
    "originalPrice" INTEGER,
    "sellingPrice" INTEGER NOT NULL,
    "costPrice" INTEGER,
    "trackInventory" BOOLEAN NOT NULL DEFAULT TRUE,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "isNewArrival" BOOLEAN NOT NULL DEFAULT FALSE,
    "isBestseller" BOOLEAN NOT NULL DEFAULT FALSE,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Product Images
CREATE TABLE IF NOT EXISTS "ProductImage" (
    "id" TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Product Variants
CREATE TABLE IF NOT EXISTS "ProductVariant" (
    "id" TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "sku" TEXT,
    "price" INTEGER,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT,
    "size" TEXT,
    "material" TEXT,
    "attributes" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Orders
CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT PRIMARY KEY,
    "orderReference" TEXT NOT NULL UNIQUE,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "deliveryInstructions" TEXT,
    "subtotal" INTEGER NOT NULL,
    "discountTotal" INTEGER NOT NULL DEFAULT 0,
    "deliveryFee" INTEGER NOT NULL DEFAULT 0,
    "finalTotal" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL DEFAULT 'COD',
    "paymentStatus" TEXT NOT NULL DEFAULT 'AWAITING_COLLECTION',
    "courierName" TEXT,
    "trackingNumber" TEXT,
    "trackingUrl" TEXT,
    "internalNotes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. Order Items
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "productId" TEXT REFERENCES "Product"("id") ON DELETE SET NULL,
    "variantId" TEXT REFERENCES "ProductVariant"("id") ON DELETE SET NULL,
    "productName" TEXT NOT NULL,
    "variantTitle" TEXT,
    "sku" TEXT,
    "unitPrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. Order Status History
CREATE TABLE IF NOT EXISTS "OrderStatusHistory" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "fromStatus" TEXT NOT NULL,
    "toStatus" TEXT NOT NULL,
    "note" TEXT,
    "changedByPasscodeId" TEXT REFERENCES "AdminPasscode"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. Coupons
CREATE TABLE IF NOT EXISTS "Coupon" (
    "id" TEXT PRIMARY KEY,
    "code" TEXT NOT NULL UNIQUE,
    "discountType" TEXT NOT NULL,
    "discountAmount" INTEGER NOT NULL,
    "minOrderValue" INTEGER NOT NULL DEFAULT 0,
    "maxDiscount" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "perCustomerLimit" INTEGER NOT NULL DEFAULT 1,
    "eligibleCategoryIds" TEXT,
    "eligibleProductIds" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. Coupon Usages
CREATE TABLE IF NOT EXISTS "CouponUsage" (
    "id" TEXT PRIMARY KEY,
    "couponId" TEXT NOT NULL REFERENCES "Coupon"("id") ON DELETE CASCADE,
    "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "discountApplied" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 14. Bundles
CREATE TABLE IF NOT EXISTS "Bundle" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "bundleType" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "minQuantity" INTEGER NOT NULL DEFAULT 2,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 15. Bundle Items
CREATE TABLE IF NOT EXISTS "BundleItem" (
    "id" TEXT PRIMARY KEY,
    "bundleId" TEXT NOT NULL REFERENCES "Bundle"("id") ON DELETE CASCADE,
    "productId" TEXT REFERENCES "Product"("id") ON DELETE CASCADE,
    "variantId" TEXT REFERENCES "ProductVariant"("id") ON DELETE CASCADE,
    "requiredQuantity" INTEGER NOT NULL DEFAULT 1
);

-- 16. Delivery Rules
CREATE TABLE IF NOT EXISTS "DeliveryRule" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "province" TEXT,
    "fee" INTEGER NOT NULL DEFAULT 0,
    "minOrderForFreeDelivery" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "estimatedDays" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 17. Store Settings
CREATE TABLE IF NOT EXISTS "StoreSetting" (
    "id" TEXT PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 18. Lookbook Entries
CREATE TABLE IF NOT EXISTS "LookbookEntry" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "caption" TEXT,
    "imageUrl" TEXT NOT NULL,
    "associatedProductIds" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 19. Product Reviews
CREATE TABLE IF NOT EXISTS "ProductReview" (
    "id" TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "customerName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "reviewText" TEXT NOT NULL,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT FALSE,
    "isApproved" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 20. Wishlist Items
CREATE TABLE IF NOT EXISTS "WishlistItem" (
    "id" TEXT PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WishlistItem_sessionId_productId_key" UNIQUE ("sessionId", "productId")
);

-- 21. Email Logs
CREATE TABLE IF NOT EXISTS "EmailLog" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT REFERENCES "Order"("id") ON DELETE SET NULL,
    "emailType" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "ProductVariant_productId_idx" ON "ProductVariant"("productId");
CREATE INDEX IF NOT EXISTS "ProductImage_productId_idx" ON "ProductImage"("productId");
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
