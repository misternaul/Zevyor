import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentAdmin, checkPermission } from '@/lib/auth';
import AdminSettingsClient from '@/components/admin/AdminSettingsClient';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  if (!checkPermission(admin, 'SETTINGS', 'VIEW')) {
    redirect('/admin');
  }

  const [dbSettings, emailLogs] = await Promise.all([
    db.storeSetting.findMany(),
    db.emailLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  const settingsMap: Record<string, string> = {};
  dbSettings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  const resendConfigured = !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 0);
  const canEdit = checkPermission(admin, 'SETTINGS', 'EDIT');

  return (
    <div className="space-y-6">
      <div className="border-b border-brand-cream-dark pb-4">
        <h1 className="text-2xl font-serif text-brand-black">Store Configuration & Content</h1>
        <p className="text-xs text-brand-grey mt-0.5">
          Manage brand identities, homepage hero presentation, customer care policies, and transactional email.
        </p>
      </div>

      <AdminSettingsClient
        settings={settingsMap}
        canEdit={canEdit}
        resendConfigured={resendConfigured}
        emailLogs={emailLogs}
      />
    </div>
  );
}
