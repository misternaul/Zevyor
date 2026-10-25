import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentAdmin, checkPermission } from '@/lib/auth';
import { Gift, Plus } from 'lucide-react';

export const revalidate = 0;

export default async function AdminBundlesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  if (!checkPermission(admin, 'BUNDLES', 'VIEW')) {
    redirect('/admin');
  }

  const bundles = await db.bundle.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-brand-cream-dark pb-4">
        <h1 className="text-2xl font-serif text-brand-black">Promotional Bundles & Offers</h1>
        <p className="text-xs text-brand-grey mt-0.5">
          Quantity-based discounts and curated bundle promotions (e.g. buy 2 watches save 15%).
        </p>
      </div>

      <div className="bg-white border border-brand-cream-dark overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-brand-cream uppercase text-brand-black font-semibold border-b border-brand-cream-dark">
            <tr>
              <th className="p-3">Bundle Title</th>
              <th className="p-3">Type</th>
              <th className="p-3">Discount Rule</th>
              <th className="p-3">Min Quantity</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-cream-dark">
            {bundles.map((b) => (
              <tr key={b.id} className="hover:bg-brand-cream-light/60 transition">
                <td className="p-3 font-semibold text-brand-black">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-4 h-4 text-brand-burgundy" />
                    <span>{b.title}</span>
                  </div>
                  {b.description && (
                    <p className="text-[11px] text-brand-grey mt-0.5">{b.description}</p>
                  )}
                </td>
                <td className="p-3 font-mono">{b.bundleType}</td>
                <td className="p-3 font-bold text-brand-black">
                  {b.discountType === 'PERCENTAGE'
                    ? `${b.discountValue}% OFF`
                    : `Rs. ${b.discountValue.toLocaleString()} OFF`}
                </td>
                <td className="p-3">{b.minQuantity} items</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      b.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {b.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
