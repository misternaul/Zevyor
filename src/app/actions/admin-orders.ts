'use server';

import { db } from '@/lib/db';
import { checkPermission, getCurrentAdmin, logAuditEvent } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(params: {
  orderId: string;
  newStatus: string;
  note?: string;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !checkPermission(admin, 'ORDERS', 'EDIT')) {
    return { success: false, error: 'Unauthorized: You do not have permission to modify orders.' };
  }

  const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(params.newStatus)) {
    return { success: false, error: 'Invalid order status transition.' };
  }

  try {
    const order = await db.order.findUnique({
      where: { id: params.orderId },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    const previousStatus = order.status;
    if (previousStatus === params.newStatus) {
      return { success: true };
    }

    await db.$transaction(async (tx) => {
      // If transitioning to CANCELLED from non-cancelled status, restore stock
      if (params.newStatus === 'CANCELLED' && previousStatus !== 'CANCELLED') {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stockQuantity: { increment: item.quantity },
              },
            });
          }
        }
      }

      // If transitioning from CANCELLED back to active status, re-check and decrement stock
      if (previousStatus === 'CANCELLED' && params.newStatus !== 'CANCELLED') {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stockQuantity: { decrement: item.quantity },
              },
            });
          }
        }
      }

      await tx.order.update({
        where: { id: params.orderId },
        data: {
          status: params.newStatus,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: params.orderId,
          fromStatus: previousStatus,
          toStatus: params.newStatus,
          note: params.note || `Status changed from ${previousStatus} to ${params.newStatus}`,
          changedByPasscodeId: admin.passcodeId,
        },
      });
    });

    await logAuditEvent({
      passcodeId: admin.passcodeId,
      passcodeLabel: admin.label,
      action: 'UPDATE_ORDER_STATUS',
      entity: 'Order',
      entityId: params.orderId,
      changeSummary: `Changed status of order ${order.orderReference} from ${previousStatus} to ${params.newStatus}.`,
    });

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${params.orderId}`);

    return { success: true };
  } catch (err: any) {
    console.error('updateOrderStatus error:', err.message);
    return { success: false, error: err.message || 'Failed to update order status.' };
  }
}

export async function updateOrderPaymentStatus(params: {
  orderId: string;
  paymentStatus: string;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !checkPermission(admin, 'ORDERS', 'EDIT')) {
    return { success: false, error: 'Unauthorized: You do not have permission to modify order payment status.' };
  }

  const valid = ['AWAITING_COLLECTION', 'COLLECTED', 'REFUNDED'];
  if (!valid.includes(params.paymentStatus)) {
    return { success: false, error: 'Invalid payment status.' };
  }

  try {
    const order = await db.order.update({
      where: { id: params.orderId },
      data: { paymentStatus: params.paymentStatus },
    });

    await logAuditEvent({
      passcodeId: admin.passcodeId,
      passcodeLabel: admin.label,
      action: 'UPDATE_PAYMENT_STATUS',
      entity: 'Order',
      entityId: params.orderId,
      changeSummary: `Updated payment status of order ${order.orderReference} to ${params.paymentStatus}.`,
    });

    revalidatePath('/admin/orders');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update payment status.' };
  }
}

export async function updateOrderCourier(params: {
  orderId: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !checkPermission(admin, 'ORDERS', 'EDIT')) {
    return { success: false, error: 'Unauthorized: You do not have permission to modify orders.' };
  }

  try {
    const order = await db.order.update({
      where: { id: params.orderId },
      data: {
        courierName: params.courierName?.trim() || null,
        trackingNumber: params.trackingNumber?.trim() || null,
        trackingUrl: params.trackingUrl?.trim() || null,
      },
    });

    await logAuditEvent({
      passcodeId: admin.passcodeId,
      passcodeLabel: admin.label,
      action: 'UPDATE_COURIER_DETAILS',
      entity: 'Order',
      entityId: params.orderId,
      changeSummary: `Updated courier details for order ${order.orderReference} (Courier: ${order.courierName || 'None'}, Tracking: ${order.trackingNumber || 'None'}).`,
    });

    revalidatePath('/admin/orders');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update courier details.' };
  }
}

export async function addOrderNote(params: { orderId: string; note: string }) {
  const admin = await getCurrentAdmin();
  if (!admin || !checkPermission(admin, 'ORDERS', 'EDIT')) {
    return { success: false, error: 'Unauthorized: You do not have permission to add notes.' };
  }

  try {
    const order = await db.order.findUnique({ where: { id: params.orderId } });
    if (!order) return { success: false, error: 'Order not found.' };

    const timestamp = new Date().toLocaleString();
    const updatedNotes = order.internalNotes
      ? `${order.internalNotes}\n[${timestamp} - ${admin.label}]: ${params.note.trim()}`
      : `[${timestamp} - ${admin.label}]: ${params.note.trim()}`;

    await db.order.update({
      where: { id: params.orderId },
      data: { internalNotes: updatedNotes },
    });

    revalidatePath('/admin/orders');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add note.' };
  }
}
