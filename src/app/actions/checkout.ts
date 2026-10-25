'use server';

import { db } from '@/lib/db';
import { recalculateOrder } from '@/lib/commerce';
import { sendOrderEmails } from '@/lib/email';
import { z } from 'zod';
import crypto from 'crypto';

const CheckoutSchema = z.object({
  customerName: z.string().min(2, 'Please enter your full name (at least 2 characters)'),
  customerPhone: z.string().min(10, 'Please enter a valid Pakistani mobile number (e.g. 0300 1234567)'),
  customerEmail: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  province: z.string().min(2, 'Please select your province or region'),
  city: z.string().min(2, 'Please enter your city'),
  deliveryAddress: z.string().min(10, 'Please provide a complete street/house address for courier delivery'),
  deliveryInstructions: z.string().optional(),
  couponCode: z.string().optional(),
  idempotencyKey: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().nullable().optional(),
      quantity: z.number().int().positive(),
    })
  ).min(1, 'Your cart is empty'),
});

function generateOrderReference(): string {
  const date = new Date();
  const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars hex
  return `ZVR-${yearMonth}-${randomChars}`;
}

export async function submitCheckoutOrder(formData: unknown) {
  try {
    const parseResult = CheckoutSchema.safeParse(formData);
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.errors[0]?.message || 'Invalid checkout information provided.',
      };
    }

    const {
      customerName,
      customerPhone,
      customerEmail,
      province,
      city,
      deliveryAddress,
      deliveryInstructions,
      couponCode,
      items,
    } = parseResult.data;

    // Server-side recalculation of prices, promotions, and delivery
    const calcResult = await recalculateOrder({
      items,
      couponCode,
      city,
      province,
      customerPhone,
    });

    if (!calcResult.success || !calcResult.data) {
      return {
        success: false,
        error: calcResult.error || 'Failed to calculate order totals.',
      };
    }

    const orderData = calcResult.data;
    const orderReference = generateOrderReference();

    // Execute in atomic database transaction
    const createdOrder = await db.$transaction(async (tx) => {
      // 1. Verify and deduct stock
      for (const item of orderData.items) {
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: true },
          });

          if (!variant) {
            throw new Error(`Variant for "${item.productName}" not found.`);
          }

          if (variant.product.trackInventory) {
            if (variant.stockQuantity < item.quantity) {
              throw new Error(
                `Inventory depleted: "${item.productName} - ${item.variantTitle}" only has ${variant.stockQuantity} remaining.`
              );
            }

            // Deduct stock
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stockQuantity: { decrement: item.quantity },
              },
            });
          }
        }
      }

      // 2. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderReference,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail && customerEmail.trim() !== '' ? customerEmail.trim() : null,
          province: province.trim(),
          city: city.trim(),
          deliveryAddress: deliveryAddress.trim(),
          deliveryInstructions: deliveryInstructions?.trim() || null,
          subtotal: orderData.subtotal,
          discountTotal: orderData.discountTotal,
          deliveryFee: orderData.deliveryFee,
          finalTotal: orderData.finalTotal,
          status: 'PENDING',
          paymentMethod: 'COD',
          paymentStatus: 'AWAITING_COLLECTION',
          items: {
            create: orderData.items.map((it) => ({
              productId: it.productId,
              variantId: it.variantId || null,
              productName: it.productName,
              variantTitle: it.variantTitle || null,
              sku: it.sku || null,
              unitPrice: it.unitPrice,
              quantity: it.quantity,
              totalPrice: it.totalPrice,
            })),
          },
          statusHistory: {
            create: {
              fromStatus: 'NONE',
              toStatus: 'PENDING',
              note: `Cash on Delivery order placed via online storefront.`,
            },
          },
        },
      });

      // 3. Record coupon usage if applied
      if (orderData.discountBreakdown.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: orderData.discountBreakdown.couponCode },
        });

        if (coupon) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usageCount: { increment: 1 } },
          });

          await tx.couponUsage.create({
            data: {
              couponId: coupon.id,
              orderId: newOrder.id,
              customerPhone: customerPhone.trim(),
              customerEmail: customerEmail && customerEmail.trim() !== '' ? customerEmail.trim() : null,
              discountApplied: orderData.discountBreakdown.couponDiscount,
            },
          });
        }
      }

      return newOrder;
    });

    // 4. Asynchronous email attempt (non-blocking)
    try {
      await sendOrderEmails({ orderId: createdOrder.id });
    } catch (emailErr) {
      console.warn('Background email dispatch failed gracefully:', emailErr);
    }

    return {
      success: true,
      orderReference: createdOrder.orderReference,
      finalTotal: createdOrder.finalTotal,
    };
  } catch (error: any) {
    console.error('Order creation transaction failed:', error.message);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while placing your order. Please try again.',
    };
  }
}
