'use server';

import { db } from '@/lib/db';
import { checkPermission, getCurrentAdmin, logAuditEvent } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Store Settings
export async function updateStoreSettings(settings: Record<string, string>) {
  const admin = await getCurrentAdmin();
  if (!admin || !checkPermission(admin, 'SETTINGS', 'EDIT')) {
    return { success: false, error: 'Unauthorized: You do not have permission to modify store settings.' };
  }

  try {
    for (const [key, value] of Object.entries(settings)) {
      await db.storeSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    await logAuditEvent({
      passcodeId: admin.passcodeId,
      passcodeLabel: admin.label,
      action: 'UPDATE_STORE_SETTINGS',
      entity: 'StoreSetting',
      changeSummary: `Updated store configuration keys: ${Object.keys(settings).join(', ')}.`,
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update store settings.' };
  }
}

// Delivery Rules
export async function upsertDeliveryRule(data: {
  id?: string;
  name: string;
  city?: string | null;
  province?: string | null;
  fee: number;
  minOrderForFreeDelivery?: number | null;
  priority?: number;
  estimatedDays?: string | null;
  isActive?: boolean;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !checkPermission(admin, 'DELIVERY', 'EDIT')) {
    return { success: false, error: 'Unauthorized: You do not have permission to modify delivery rules.' };
  }

  try {
    if (data.id) {
      await db.deliveryRule.update({
        where: { id: data.id },
        data: {
          name: data.name,
          city: data.city || null,
          province: data.province || null,
          fee: data.fee,
          minOrderForFreeDelivery: data.minOrderForFreeDelivery || null,
          priority: data.priority ?? 0,
          estimatedDays: data.estimatedDays || null,
          isActive: data.isActive ?? true,
        },
      });
    } else {
      await db.deliveryRule.create({
        data: {
          name: data.name,
          city: data.city || null,
          province: data.province || null,
          fee: data.fee,
          minOrderForFreeDelivery: data.minOrderForFreeDelivery || null,
          priority: data.priority ?? 0,
          estimatedDays: data.estimatedDays || null,
          isActive: data.isActive ?? true,
        },
      });
    }

    await logAuditEvent({
      passcodeId: admin.passcodeId,
      passcodeLabel: admin.label,
      action: data.id ? 'UPDATE_DELIVERY_RULE' : 'CREATE_DELIVERY_RULE',
      entity: 'DeliveryRule',
      changeSummary: `Upserted delivery rule "${data.name}" (Fee: Rs. ${data.fee}).`,
    });

    revalidatePath('/admin/delivery');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save delivery rule.' };
  }
}

export async function deleteDeliveryRule(ruleId: string) {
  const admin = await getCurrentAdmin();
  if (!admin || !checkPermission(admin, 'DELIVERY', 'EDIT')) {
    return { success: false, error: 'Unauthorized: You do not have permission to delete delivery rules.' };
  }

  try {
    await db.deliveryRule.delete({ where: { id: ruleId } });
    revalidatePath('/admin/delivery');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete delivery rule.' };
  }
}

// Coupons
export async function upsertCoupon(data: {
  id?: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountAmount: number;
  minOrderValue?: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  isActive?: boolean;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !checkPermission(admin, 'COUPONS', 'EDIT')) {
    return { success: false, error: 'Unauthorized: You do not have permission to modify coupons.' };
  }

  const cleanCode = data.code.trim().toUpperCase();

  try {
    if (data.id) {
      await db.coupon.update({
        where: { id: data.id },
        data: {
          code: cleanCode,
          discountType: data.discountType,
          discountAmount: data.discountAmount,
          minOrderValue: data.minOrderValue ?? 0,
          maxDiscount: data.maxDiscount || null,
          usageLimit: data.usageLimit || null,
          isActive: data.isActive ?? true,
        },
      });
    } else {
      await db.coupon.create({
        data: {
          code: cleanCode,
          discountType: data.discountType,
          discountAmount: data.discountAmount,
          minOrderValue: data.minOrderValue ?? 0,
          maxDiscount: data.maxDiscount || null,
          usageLimit: data.usageLimit || null,
          isActive: data.isActive ?? true,
        },
      });
    }

    await logAuditEvent({
      passcodeId: admin.passcodeId,
      passcodeLabel: admin.label,
      action: data.id ? 'UPDATE_COUPON' : 'CREATE_COUPON',
      entity: 'Coupon',
      changeSummary: `Upserted coupon "${cleanCode}" (${data.discountType}: ${data.discountAmount}).`,
    });

    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save coupon.' };
  }
}

export async function deleteCoupon(couponId: string) {
  const admin = await getCurrentAdmin();
  if (!admin || !checkPermission(admin, 'COUPONS', 'EDIT')) {
    return { success: false, error: 'Unauthorized: You do not have permission to delete coupons.' };
  }

  try {
    await db.coupon.delete({ where: { id: couponId } });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete coupon.' };
  }
}

// Bundles
export async function upsertBundle(data: {
  id?: string;
  title: string;
  description?: string;
  bundleType: string;
  discountType: string;
  discountValue: number;
  minQuantity?: number;
  isActive?: boolean;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !checkPermission(admin, 'BUNDLES', 'EDIT')) {
    return { success: false, error: 'Unauthorized: You do not have permission to modify bundles.' };
  }

  try {
    if (data.id) {
      await db.bundle.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description || null,
          bundleType: data.bundleType,
          discountType: data.discountType,
          discountValue: data.discountValue,
          minQuantity: data.minQuantity ?? 2,
          isActive: data.isActive ?? true,
        },
      });
    } else {
      await db.bundle.create({
        data: {
          title: data.title,
          description: data.description || null,
          bundleType: data.bundleType,
          discountType: data.discountType,
          discountValue: data.discountValue,
          minQuantity: data.minQuantity ?? 2,
          isActive: data.isActive ?? true,
        },
      });
    }

    revalidatePath('/admin/bundles');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save bundle.' };
  }
}

export async function deleteBundle(bundleId: string) {
  const admin = await getCurrentAdmin();
  if (!admin || !checkPermission(admin, 'BUNDLES', 'EDIT')) {
    return { success: false, error: 'Unauthorized: You do not have permission to delete bundles.' };
  }

  try {
    await db.bundle.delete({ where: { id: bundleId } });
    revalidatePath('/admin/bundles');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete bundle.' };
  }
}

// Lookbook
export async function upsertLookbookEntry(data: {
  id?: string;
  title: string;
  caption?: string;
  imageUrl: string;
  displayOrder?: number;
  isPublished?: boolean;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !checkPermission(admin, 'LOOKBOOK', 'EDIT')) {
    return { success: false, error: 'Unauthorized: You do not have permission to modify lookbook.' };
  }

  try {
    if (data.id) {
      await db.lookbookEntry.update({
        where: { id: data.id },
        data: {
          title: data.title,
          caption: data.caption || null,
          imageUrl: data.imageUrl,
          displayOrder: data.displayOrder ?? 0,
          isPublished: data.isPublished ?? true,
        },
      });
    } else {
      await db.lookbookEntry.create({
        data: {
          title: data.title,
          caption: data.caption || null,
          imageUrl: data.imageUrl,
          displayOrder: data.displayOrder ?? 0,
          isPublished: data.isPublished ?? true,
        },
      });
    }

    revalidatePath('/lookbook');
    revalidatePath('/admin/lookbook');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save lookbook entry.' };
  }
}

export async function deleteLookbookEntry(id: string) {
  const admin = await getCurrentAdmin();
  if (!admin || !checkPermission(admin, 'LOOKBOOK', 'EDIT')) {
    return { success: false, error: 'Unauthorized: You do not have permission to delete lookbook.' };
  }

  try {
    await db.lookbookEntry.delete({ where: { id } });
    revalidatePath('/lookbook');
    revalidatePath('/admin/lookbook');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete lookbook entry.' };
  }
}

// Reviews
export async function moderateReview(params: { reviewId: string; isApproved: boolean }) {
  const admin = await getCurrentAdmin();
  if (!admin || !checkPermission(admin, 'REVIEWS', 'EDIT')) {
    return { success: false, error: 'Unauthorized: You do not have permission to moderate reviews.' };
  }

  try {
    await db.productReview.update({
      where: { id: params.reviewId },
      data: { isApproved: params.isApproved },
    });
    revalidatePath('/admin/reviews');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to moderate review.' };
  }
}
