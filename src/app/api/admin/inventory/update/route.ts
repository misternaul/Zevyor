import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin, checkPermission, logAuditEvent } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin || !checkPermission(admin, 'INVENTORY', 'EDIT')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { variantId, stockQuantity } = await req.json();

    if (!variantId || typeof stockQuantity !== 'number') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const updated = await db.productVariant.update({
      where: { id: variantId },
      data: { stockQuantity: Math.max(0, stockQuantity) },
      include: { product: true },
    });

    await logAuditEvent({
      passcodeId: admin.passcodeId,
      passcodeLabel: admin.label,
      action: 'UPDATE_INVENTORY',
      entity: 'ProductVariant',
      entityId: variantId,
      changeSummary: `Updated stock for "${updated.product.name} - ${updated.title}" to ${updated.stockQuantity} units.`,
    });

    return NextResponse.json({ success: true, variant: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
