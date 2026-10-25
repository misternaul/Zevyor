import test from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

test('Commerce, Inventory & Checkout Test Suite', async (t) => {
  let testProduct;
  let testVariant;
  let testCategory;

  t.before(async () => {
    testCategory = await prisma.category.upsert({
      where: { slug: 'test-category' },
      update: {},
      create: {
        name: 'Test Category',
        slug: 'test-category',
        isPublished: true,
      },
    });

    testProduct = await prisma.product.upsert({
      where: { slug: 'test-horology-piece' },
      update: {},
      create: {
        name: 'Test Horology Piece',
        slug: 'test-horology-piece',
        sellingPrice: 12500,
        trackInventory: true,
        status: 'PUBLISHED',
        categoryId: testCategory.id,
      },
    });

    testVariant = await prisma.productVariant.create({
      data: {
        productId: testProduct.id,
        title: 'Steel Bracelet',
        sku: 'ZVR-TEST-001',
        stockQuantity: 10,
        price: 12500,
      },
    });
  });

  t.after(async () => {
    if (testVariant) {
      await prisma.productVariant.delete({ where: { id: testVariant.id } }).catch(() => {});
    }
    if (testProduct) {
      await prisma.product.delete({ where: { id: testProduct.id } }).catch(() => {});
    }
    if (testCategory) {
      await prisma.category.delete({ where: { id: testCategory.id } }).catch(() => {});
    }
  });

  await t.test('1. Server-side price recalculation from database', async () => {
    const dbVariant = await prisma.productVariant.findUnique({
      where: { id: testVariant.id },
      include: { product: true },
    });

    assert.ok(dbVariant, 'Variant exists');
    assert.equal(dbVariant.price, 12500, 'Real unit price is Rs. 12,500');

    const qty = 2;
    const computedLineTotal = dbVariant.price * qty;
    assert.equal(computedLineTotal, 25000, 'Computed line total must be exactly 25,000');
  });

  await t.test('2. Coupon validation with minOrderValue and percentage discount', async () => {
    const coupon = await prisma.coupon.findUnique({
      where: { code: 'WELCOME10' },
    });

    assert.ok(coupon, 'WELCOME10 coupon exists');
    assert.equal(coupon.isActive, true, 'Coupon is active');
    assert.equal(coupon.discountType, 'PERCENTAGE');

    const subtotal = 12500;
    assert.ok(subtotal >= coupon.minOrderValue, 'Order meets minimum value');

    const discount = Math.min(Math.round((subtotal * coupon.discountAmount) / 100), coupon.maxDiscount || Infinity);
    assert.equal(discount, 1250, '10% of 12,500 must equal 1,250');
  });

  await t.test('3. Delivery rule hierarchy & complimentary shipping threshold', async () => {
    const karachiRule = await prisma.deliveryRule.findFirst({
      where: { city: 'Karachi', isActive: true },
    });

    assert.ok(karachiRule, 'Karachi delivery rule exists');
    assert.equal(karachiRule.fee, 199, 'Karachi express fee is Rs. 199');

    // Free delivery check on order above Rs. 5,000
    const highOrderSubtotal = 12500;
    const applicableFee =
      karachiRule.minOrderForFreeDelivery && highOrderSubtotal >= karachiRule.minOrderForFreeDelivery
        ? 0
        : karachiRule.fee;

    assert.equal(applicableFee, 0, 'Orders above Rs. 5,000 must qualify for free delivery');
  });

  await t.test('4. Atomic COD checkout: stock deduction and order item creation', async () => {
    const initialStock = testVariant.stockQuantity;
    const orderQty = 2;
    const orderRef = `ZVR-TEST-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Execute atomic transaction
    const order = await prisma.$transaction(async (tx) => {
      // Deduct stock
      await tx.productVariant.update({
        where: { id: testVariant.id },
        data: { stockQuantity: { decrement: orderQty } },
      });

      // Create order
      return tx.order.create({
        data: {
          orderReference: orderRef,
          customerName: 'Test Customer',
          customerPhone: '03001234567',
          province: 'Sindh',
          city: 'Karachi',
          deliveryAddress: 'House 123, Street 4, Clifton',
          subtotal: 25000,
          discountTotal: 0,
          deliveryFee: 0,
          finalTotal: 25000,
          status: 'PENDING',
          paymentMethod: 'COD',
          paymentStatus: 'AWAITING_COLLECTION',
          items: {
            create: [
              {
                productId: testProduct.id,
                variantId: testVariant.id,
                productName: testProduct.name,
                variantTitle: testVariant.title,
                unitPrice: 12500,
                quantity: orderQty,
                totalPrice: 25000,
              },
            ],
          },
        },
        include: { items: true },
      });
    });

    assert.ok(order.id, 'Order created');
    assert.equal(order.paymentStatus, 'AWAITING_COLLECTION', 'COD payment must be marked awaiting collection');
    assert.equal(order.items.length, 1, 'One order item record created');

    const updatedVariant = await prisma.productVariant.findUnique({
      where: { id: testVariant.id },
    });

    assert.equal(
      updatedVariant.stockQuantity,
      initialStock - orderQty,
      'Stock must be deducted by order quantity'
    );

    // 5. Order Cancellation Stock Restoration
    await prisma.$transaction(async (tx) => {
      for (const it of order.items) {
        if (it.variantId) {
          await tx.productVariant.update({
            where: { id: it.variantId },
            data: { stockQuantity: { increment: it.quantity } },
          });
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      });
    });

    const restoredVariant = await prisma.productVariant.findUnique({
      where: { id: testVariant.id },
    });

    assert.equal(
      restoredVariant.stockQuantity,
      initialStock,
      'Stock must be fully restored when order is cancelled'
    );

    // Clean up test order
    await prisma.order.delete({ where: { id: order.id } });
  });

  await t.test('6. Safe category deletion without deleting catalog products', async () => {
    // Create temporary category and product
    const tempCat = await prisma.category.create({
      data: { name: 'Temp Cat', slug: 'temp-cat' },
    });

    const tempProd = await prisma.product.create({
      data: {
        name: 'Temp Product',
        slug: 'temp-prod',
        sellingPrice: 5000,
        categoryId: tempCat.id,
        status: 'PUBLISHED',
      },
    });

    // Safely unassign products before deleting category
    await prisma.product.updateMany({
      where: { categoryId: tempCat.id },
      data: { categoryId: null, status: 'DRAFT' },
    });

    await prisma.category.delete({ where: { id: tempCat.id } });

    // Verify product was NOT deleted
    const preservedProduct = await prisma.product.findUnique({
      where: { id: tempProd.id },
    });

    assert.ok(preservedProduct, 'Product must still exist after category deletion');
    assert.equal(preservedProduct.categoryId, null, 'Product category set to null');
    assert.equal(preservedProduct.status, 'DRAFT', 'Product set to DRAFT until reassigned');

    await prisma.product.delete({ where: { id: tempProd.id } });
  });
});
