import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentAdmin, checkPermission } from '@/lib/auth';
import AdminDeliveryClient from '@/components/admin/AdminDeliveryClient';

export const revalidate = 0;

export default async function AdminDeliveryPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  if (!checkPermission(admin, 'DELIVERY', 'VIEW')) {
    redirect('/admin');
  }

  const rules = await db.deliveryRule.findMany({
    orderBy: { priority: 'desc' },
  });

  const canEdit = checkPermission(admin, 'DELIVERY', 'EDIT');

  return (
    <div className="space-y-6">
      <div className="border-b border-brand-cream-dark pb-4">
        <h1 className="text-2xl font-serif text-brand-black">Delivery & Courier Shipping Rules</h1>
        <p className="text-xs text-brand-grey mt-0.5">
          Configure city tariffs, provincial rules, and nationwide fallback rates for Cash on Delivery.
        </p>
      </div>

      <AdminDeliveryClient rules={rules} canEdit={canEdit} />
    </div>
  );
}
