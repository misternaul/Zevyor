import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentAdmin, checkPermission } from '@/lib/auth';
import AdminLookbookClient from '@/components/admin/AdminLookbookClient';

export const revalidate = 0;

export default async function AdminLookbookPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  if (!checkPermission(admin, 'LOOKBOOK', 'VIEW')) {
    redirect('/admin');
  }

  const entries = await db.lookbookEntry.findMany({
    orderBy: { displayOrder: 'asc' },
  });

  const canEdit = checkPermission(admin, 'LOOKBOOK', 'EDIT');

  return (
    <div className="space-y-6">
      <div className="border-b border-brand-cream-dark pb-4">
        <h1 className="text-2xl font-serif text-brand-black">Editorial Lookbook Campaign</h1>
        <p className="text-xs text-brand-grey mt-0.5">
          Curate brand campaign photography and aesthetic lookbook exhibits.
        </p>
      </div>

      <AdminLookbookClient entries={entries} canEdit={canEdit} />
    </div>
  );
}
