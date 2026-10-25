import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentAdmin, checkPermission } from '@/lib/auth';
import AdminInventoryClient from '@/components/admin/AdminInventoryClient';

export const revalidate = 0;

export default async function AdminInventoryPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  if (!checkPermission(admin, 'INVENTORY', 'VIEW')) {
    redirect('/admin');
  }

  const variants = await db.productVariant.findMany({
    include: {
      product: {
        include: {
          category: true,
          images: { where: { isPrimary: true } },
        },
      },
    },
    orderBy: { stockQuantity: 'asc' },
  });

  const canEdit = checkPermission(admin, 'INVENTORY', 'EDIT');

  return (
    <div className="space-y-6">
      <div className="border-b border-brand-cream-dark pb-4">
        <h1 className="text-2xl font-serif text-brand-black">Variant Stock & Inventory Control</h1>
        <p className="text-xs text-brand-grey mt-0.5">
          Real-time inventory levels per product variant. Stock is automatically decremented on order placement and restored on cancellation.
        </p>
      </div>

      <AdminInventoryClient variants={variants} canEdit={canEdit} />
    </div>
  );
}
