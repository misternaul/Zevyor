import { db } from './db';
import { CalculatedOrder } from './types';

export interface RecalculateCartInput {
  items: {
    productId: string;
    variantId?: string | null;
    quantity: number;
  }[];
  couponCode?: string | null;
  city?: string | null;
  province?: string | null;
  customerPhone?: string | null;
}

export async function recalculateOrder(input: RecalculateCartInput): Promise<{
  success: boolean;
  error?: string;
  data?: CalculatedOrder;
}> {
  if (!input.items || input.items.length === 0) {
    return { success: false, error: 'Shopping cart is empty.' };
  }

  // Fetch all product IDs requested
  const productIds = Array.from(new Set(input.items.map((i) => i.productId)));
  const products = await db.product.findMany({
    where: {
      id: { in: productIds },
      status: 'PUBLISHED',
    },
    include: {
      variants: true,
      category: true,
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  const calculatedItems: CalculatedOrder['items'] = [];

  for (const item of input.items) {
    if (item.quantity <= 0) {
      return { success: false, error: 'Invalid product quantity.' };
    }

    const product = productMap.get(item.productId);
    if (!product) {
      return {
        success: false,
        error: `Product is no longer available in the catalogue.`,
      };
    }

    let unitPrice = product.sellingPrice;
    let variantTitle: string | null = null;
    let sku = product.sku;

    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) {
        return {
          success: false,
          error: `Selected variant for "${product.name}" is no longer available.`,
        };
      }

      if (variant.price) {
        unitPrice = variant.price;
      }
      variantTitle = variant.title;
      sku = variant.sku || product.sku;

      if (product.trackInventory && variant.stockQuantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name} - ${variant.title}". Only ${variant.stockQuantity} available.`,
        };
      }
    } else if (product.variants.length > 0) {
      // If product has variants, require variant selection
      const defaultVariant = product.variants[0];
      variantTitle = defaultVariant.title;
      sku = defaultVariant.sku || product.sku;
      if (defaultVariant.price) {
        unitPrice = defaultVariant.price;
      }

      if (product.trackInventory && defaultVariant.stockQuantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name}".`,
        };
      }
    }

    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    calculatedItems.push({
      productId: product.id,
      variantId: item.variantId || (product.variants[0]?.id ?? null),
      productName: product.name,
      variantTitle,
      sku,
      unitPrice,
      quantity: item.quantity,
      totalPrice: lineTotal,
    });
  }

  // Promotions & Discounts
  let couponDiscount = 0;
  let appliedCouponCode: string | undefined = undefined;

  if (input.couponCode && input.couponCode.trim() !== '') {
    const cleanCode = input.couponCode.trim().toUpperCase();
    const coupon = await db.coupon.findUnique({
      where: { code: cleanCode },
    });

    const now = new Date();
    if (!coupon || !coupon.isActive) {
      return { success: false, error: `Coupon "${cleanCode}" is invalid or inactive.` };
    }

    if (coupon.startDate && coupon.startDate > now) {
      return { success: false, error: `Coupon "${cleanCode}" has not started yet.` };
    }

    if (coupon.endDate && coupon.endDate < now) {
      return { success: false, error: `Coupon "${cleanCode}" has expired.` };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { success: false, error: `Coupon "${cleanCode}" usage limit has been reached.` };
    }

    if (subtotal < coupon.minOrderValue) {
      return {
        success: false,
        error: `Coupon "${cleanCode}" requires a minimum order value of Rs. ${coupon.minOrderValue.toLocaleString()}.`,
      };
    }

    // Check customer per-customer limit if phone is provided
    if (input.customerPhone && coupon.perCustomerLimit) {
      const priorUses = await db.couponUsage.count({
        where: {
          couponId: coupon.id,
          customerPhone: input.customerPhone.trim(),
        },
      });

      if (priorUses >= coupon.perCustomerLimit) {
        return {
          success: false,
          error: `Coupon "${cleanCode}" has already reached its maximum usage limit for this phone number.`,
        };
      }
    }

    if (coupon.discountType === 'PERCENTAGE') {
      let rawDisc = Math.round((subtotal * coupon.discountAmount) / 100);
      if (coupon.maxDiscount && rawDisc > coupon.maxDiscount) {
        rawDisc = coupon.maxDiscount;
      }
      couponDiscount = rawDisc;
    } else if (coupon.discountType === 'FIXED') {
      couponDiscount = Math.min(coupon.discountAmount, subtotal);
    }

    appliedCouponCode = coupon.code;
  }

  // Bundle Engine (e.g. buy 2 watches save 15%)
  let bundleDiscount = 0;
  let appliedBundleTitle: string | undefined = undefined;

  const totalWatchQty = calculatedItems.reduce((acc, it) => {
    const p = productMap.get(it.productId);
    return p?.category?.slug === 'watches' ? acc + it.quantity : acc;
  }, 0);

  const activeBundles = await db.bundle.findMany({
    where: { isActive: true },
  });

  for (const b of activeBundles) {
    if (b.bundleType === 'QUANTITY_DISCOUNT' && totalWatchQty >= b.minQuantity) {
      // Calculate watch subtotal
      const watchSubtotal = calculatedItems.reduce((acc, it) => {
        const p = productMap.get(it.productId);
        return p?.category?.slug === 'watches' ? acc + it.totalPrice : acc;
      }, 0);

      if (b.discountType === 'PERCENTAGE') {
        const bDisc = Math.round((watchSubtotal * b.discountValue) / 100);
        if (bDisc > bundleDiscount) {
          bundleDiscount = bDisc;
          appliedBundleTitle = b.title;
        }
      } else if (b.discountType === 'FIXED_DISCOUNT') {
        if (b.discountValue > bundleDiscount) {
          bundleDiscount = Math.min(b.discountValue, watchSubtotal);
          appliedBundleTitle = b.title;
        }
      }
    }
  }

  // Prevent double discounting beyond order value
  const totalDiscount = Math.min(couponDiscount + bundleDiscount, subtotal);

  // Delivery Calculations
  let deliveryFee = 299; // Default nationwide rate
  let appliedRuleName = 'Standard Nationwide Delivery';
  let estimatedDelivery = '3 - 5 business days';

  const deliveryRules = await db.deliveryRule.findMany({
    where: { isActive: true },
    orderBy: { priority: 'desc' },
  });

  const cityNorm = input.city?.trim().toLowerCase();
  const provNorm = input.province?.trim().toLowerCase();

  let matchedRule = null;

  if (cityNorm) {
    matchedRule = deliveryRules.find(
      (r) => r.city && r.city.trim().toLowerCase() === cityNorm
    );
  }

  if (!matchedRule && provNorm) {
    matchedRule = deliveryRules.find(
      (r) => !r.city && r.province && r.province.trim().toLowerCase() === provNorm
    );
  }

  if (!matchedRule) {
    // Default rule without city or province
    matchedRule = deliveryRules.find((r) => !r.city && !r.province);
  }

  if (matchedRule) {
    appliedRuleName = matchedRule.name;
    deliveryFee = matchedRule.fee;
    if (matchedRule.estimatedDays) {
      estimatedDelivery = matchedRule.estimatedDays;
    }

    // Free delivery threshold check on discounted subtotal
    const discountedSubtotal = subtotal - totalDiscount;
    if (
      matchedRule.minOrderForFreeDelivery &&
      discountedSubtotal >= matchedRule.minOrderForFreeDelivery
    ) {
      deliveryFee = 0;
      appliedRuleName += ' (Complimentary Free Delivery)';
    }
  }

  const finalTotal = subtotal - totalDiscount + deliveryFee;

  return {
    success: true,
    data: {
      items: calculatedItems,
      subtotal,
      discountTotal: totalDiscount,
      discountBreakdown: {
        couponCode: appliedCouponCode,
        couponDiscount,
        bundleDiscount,
        bundleTitle: appliedBundleTitle,
      },
      deliveryFee,
      appliedDeliveryRule: appliedRuleName,
      finalTotal,
      estimatedDelivery,
    },
  };
}
