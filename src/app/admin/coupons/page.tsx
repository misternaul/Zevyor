import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentAdmin, checkPermission } from '@/lib/auth';
import AdminCouponsClient from '@/components/admin/AdminCouponsClient';

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  if (!checkPermission(admin, 'COUPONS', 'VIEW')) {
    redirect('/admin');
  }

  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const canEdit = checkPermission(admin, 'COUPONS', 'EDIT');

  return (
    <div className="space-y-6">
      <div className="border-b border-brand-cream-dark pb-4">
        <h1 className="text-2xl font-serif text-brand-black">Discounts & Promotion Coupons</h1>
        <p className="text-xs text-brand-grey mt-0.5">
          Manage promotional discount codes. Coupons are validated server-side during checkout.
        </p>
      </div>

      <AdminCouponsClient coupons={coupons} canEdit={canEdit} />
    </div>
  );
}
