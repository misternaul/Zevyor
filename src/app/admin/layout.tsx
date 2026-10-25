import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  // If not logged in, we let the page handle login or redirect
  // Note: if on login page, children will be the login form, so we don't block
  if (!admin) {
    return <div className="min-h-screen bg-brand-cream-light">{children}</div>;
  }

  return (
    <div className="min-h-screen flex bg-brand-cream-light">
      <AdminSidebar
        admin={{
          id: admin.passcodeId,
          label: admin.label,
          isOwner: admin.isOwner,
          permissions: admin.permissions,
        }}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-brand-cream-dark px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-burgundy font-bold">
              Zevyor Console
            </span>
            <span className="text-brand-grey text-xs">/</span>
            <span className="text-xs text-brand-black font-semibold">Store Administration</span>
          </div>
          <div className="text-xs text-brand-grey flex items-center space-x-3">
            <span>Operating Currency: <strong>PKR</strong></span>
            <span>•</span>
            <span className="capitalize">
              Access: <strong>{admin.isOwner ? 'Full Owner' : admin.label}</strong>
            </span>
          </div>
        </header>

        <main className="p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
