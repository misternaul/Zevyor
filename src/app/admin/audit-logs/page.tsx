import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentAdmin, checkPermission } from '@/lib/auth';
import { History, Shield, Search } from 'lucide-react';

interface AuditLogsPageProps {
  searchParams: {
    q?: string;
  };
}

export const revalidate = 0;

export default async function AdminAuditLogsPage({ searchParams }: AuditLogsPageProps) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  if (!checkPermission(admin, 'AUDIT_LOGS', 'VIEW')) {
    redirect('/admin');
  }

  const { q } = searchParams;

  const where: any = {};
  if (q && q.trim()) {
    where.OR = [
      { action: { contains: q.trim().toUpperCase() } },
      { entity: { contains: q.trim() } },
      { changeSummary: { contains: q.trim() } },
      { passcodeLabel: { contains: q.trim() } },
    ];
  }

  const logs = await db.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-brand-cream-dark pb-4">
        <h1 className="text-2xl font-serif text-brand-black">Administrative Audit Trail</h1>
        <p className="text-xs text-brand-grey mt-0.5">
          Immutable forensic log of all administrative actions, passcode modifications, inventory changes, and order status transitions.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <form method="GET" className="relative w-72">
          <input
            type="text"
            name="q"
            defaultValue={q || ''}
            placeholder="Search action, entity, staff..."
            className="w-full bg-white border border-brand-grey-border px-3.5 py-1.5 pl-8 text-xs focus:outline-none focus:border-brand-burgundy"
          />
          <Search className="w-3.5 h-3.5 text-brand-grey absolute left-2.5 top-2.5" />
        </form>

        <span className="text-xs text-brand-grey font-mono">
          Showing latest {logs.length} logged events
        </span>
      </div>

      <div className="bg-white border border-brand-cream-dark overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-brand-cream uppercase text-brand-black font-semibold border-b border-brand-cream-dark">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Acting Passcode</th>
              <th className="p-3">Action</th>
              <th className="p-3">Entity</th>
              <th className="p-3">Change Summary</th>
              <th className="p-3">Origin IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-cream-dark">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-brand-grey">
                  No audit logs recorded matching query.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-brand-cream-light/60 transition">
                  <td className="p-3 font-mono text-brand-grey whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 font-semibold text-brand-burgundy">
                    {log.passcodeLabel || 'System'}
                  </td>
                  <td className="p-3 font-mono font-bold text-brand-black">{log.action}</td>
                  <td className="p-3 text-brand-grey font-mono">{log.entity}</td>
                  <td className="p-3 text-brand-black max-w-md">{log.changeSummary}</td>
                  <td className="p-3 font-mono text-brand-grey">{log.ipAddress || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
