import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Truck, Clock, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | Zevyor',
  description: 'Nationwide Cash on Delivery shipping rates, timelines, and courier guidelines for Zevyor orders.',
};

export default async function ShippingPolicyPage() {
  let content =
    'All orders are processed and shipped within 24 to 48 hours. We offer reliable Cash on Delivery across Pakistan via top-tier couriers. Tracking references are provided upon dispatch.';

  try {
    const s = await db.storeSetting.findUnique({ where: { key: 'policyShipping' } });
    if (s?.value) content = s.value;
  } catch {}

  let rules: any[] = [];
  try {
    rules = await db.deliveryRule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    });
  } catch (err) {
    console.error('Delivery rules fetch error:', err);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="border-b border-brand-cream-dark pb-6 space-y-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-brand-burgundy">
          Customer Service
        </span>
        <h1 className="text-3xl font-serif text-brand-black">Shipping & Delivery Policy</h1>
        <p className="text-xs text-brand-grey">Effective for all orders across Pakistan.</p>
      </div>

      <div className="bg-white p-8 border border-brand-cream-dark space-y-6 text-sm text-brand-black/90 leading-relaxed shadow-sm">
        <p>{content}</p>

        <h3 className="text-base font-serif font-bold text-brand-black pt-4 border-t border-brand-cream-dark">
          Standard Courier Tariffs & Timelines
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-brand-cream-dark">
            <thead className="bg-brand-cream uppercase font-semibold text-brand-black">
              <tr>
                <th className="p-3 border-b border-brand-cream-dark">Destination / Region</th>
                <th className="p-3 border-b border-brand-cream-dark">Standard Tariff</th>
                <th className="p-3 border-b border-brand-cream-dark">Estimated Transit</th>
                <th className="p-3 border-b border-brand-cream-dark">Free Delivery Threshold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-cream-dark">
              {rules.map((r) => (
                <tr key={r.id}>
                  <td className="p-3 font-semibold">{r.name}</td>
                  <td className="p-3">Rs. {r.fee.toLocaleString()}</td>
                  <td className="p-3">{r.estimatedDays || '2-4 business days'}</td>
                  <td className="p-3 font-medium text-brand-burgundy">
                    {r.minOrderForFreeDelivery
                      ? `Orders above Rs. ${r.minOrderForFreeDelivery.toLocaleString()}`
                      : 'None'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-brand-cream-light p-4 border border-brand-cream-dark space-y-2 text-xs">
          <strong>Important Delivery Note:</strong>
          <p className="text-brand-grey">
            Riders are contracted to deliver sealed packages. Open inspection in front of the rider is permitted. In case of any concern, please take a photograph and contact our WhatsApp Concierge immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
