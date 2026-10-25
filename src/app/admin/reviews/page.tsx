import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentAdmin, checkPermission } from '@/lib/auth';
import AdminReviewsClient from '@/components/admin/AdminReviewsClient';

export const revalidate = 0;

export default async function AdminReviewsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  if (!checkPermission(admin, 'REVIEWS', 'VIEW')) {
    redirect('/admin');
  }

  const reviews = await db.productReview.findMany({
    orderBy: { createdAt: 'desc' },
    include: { product: true },
  });

  const canEdit = checkPermission(admin, 'REVIEWS', 'EDIT');

  return (
    <div className="space-y-6">
      <div className="border-b border-brand-cream-dark pb-4">
        <h1 className="text-2xl font-serif text-brand-black">Customer Reviews Moderation</h1>
        <p className="text-xs text-brand-grey mt-0.5">
          Reviews remain hidden from the storefront until approved by an authorized administrator.
        </p>
      </div>

      <AdminReviewsClient reviews={reviews} canEdit={canEdit} />
    </div>
  );
}
