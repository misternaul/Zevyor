import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import AdminPasscodesClient from '@/components/admin/AdminPasscodesClient';

export const revalidate = 0;

export default async function AdminPasscodesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  // Restrict to primary owner only
  if (!admin.isOwner) {
    return (
      <div className="bg-white p-8 border border-brand-cream-dark text-center space-y-3">
        <h2 className="text-lg font-serif text-brand-black">Restricted: Owner Only</h2>
        <p className="text-xs text-brand-grey">
          Only the primary store owner has authority to manage administrative passcodes and security permissions.
        </p>
      </div>
    );
  }

  const passcodes = await db.adminPasscode.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      permissions: true,
      _count: {
        select: { sessions: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-brand-cream-dark pb-4">
        <h1 className="text-2xl font-serif text-brand-black">
          Passcode Access Control & Role-Based Permissions (RBAC)
        </h1>
        <p className="text-xs text-brand-grey mt-0.5">
          Configure multi-passcode access for your team. Each credential possesses an independent matrix of view and edit permissions.
        </p>
      </div>

      <AdminPasscodesClient passcodes={passcodes as any} currentAdminId={admin.passcodeId} />
    </div>
  );
}
