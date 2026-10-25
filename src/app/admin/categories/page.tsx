import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentAdmin, checkPermission } from '@/lib/auth';
import AdminCategoriesClient from '@/components/admin/AdminCategoriesClient';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  if (!checkPermission(admin, 'CATEGORIES', 'VIEW')) {
    return (
      <div className="bg-white p-8 border border-brand-cream-dark text-center space-y-3">
        <h2 className="text-lg font-serif text-brand-black">Access Denied</h2>
        <p className="text-xs text-brand-grey">
          Your passcode does not have permission to view Category Management.
        </p>
      </div>
    );
  }

  const categories = await db.category.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  const canEdit = checkPermission(admin, 'CATEGORIES', 'EDIT');

  return (
    <div className="space-y-6">
      <div className="border-b border-brand-cream-dark pb-4">
        <h1 className="text-2xl font-serif text-brand-black">Dynamic Category Architecture</h1>
        <p className="text-xs text-brand-grey mt-0.5">
          Create, reorder, and configure product categories for future catalog expansion without altering codebase.
        </p>
      </div>

      <AdminCategoriesClient categories={categories} canEdit={canEdit} />
    </div>
  );
}
