import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentAdmin, checkPermission } from '@/lib/auth';
import AdminProductsClient from '@/components/admin/AdminProductsClient';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  if (!checkPermission(admin, 'PRODUCTS', 'VIEW')) {
    return (
      <div className="bg-white p-8 border border-brand-cream-dark text-center space-y-3">
        <h2 className="text-lg font-serif text-brand-black">Access Denied</h2>
        <p className="text-xs text-brand-grey">
          Your passcode does not possess permission to access Product Management.
        </p>
      </div>
    );
  }

  const [products, categories] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
        variants: true,
        category: true,
      },
    }),
    db.category.findMany({
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  const canEdit = checkPermission(admin, 'PRODUCTS', 'EDIT');

  return (
    <div className="space-y-6">
      <div className="border-b border-brand-cream-dark pb-4">
        <h1 className="text-2xl font-serif text-brand-black">Product Catalogue Management</h1>
        <p className="text-xs text-brand-grey mt-0.5">
          Manage product listings, multi-image galleries, variant stock levels, and publication states.
        </p>
      </div>

      <AdminProductsClient
        products={products}
        categories={categories}
        isOwner={admin.isOwner}
        canEdit={canEdit}
      />
    </div>
  );
}
