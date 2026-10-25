import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Exchange Policy | Zevyor',
  description: '7-day inspection and hassle-free exchange policy on Zevyor luxury items.',
};

export default async function ReturnsPolicyPage() {
  let content =
    'We offer a 7-day hassle-free exchange policy on unworn items in pristine original condition with packaging intact. Please contact our support team on WhatsApp to initiate an exchange.';

  try {
    const s = await db.storeSetting.findUnique({ where: { key: 'policyReturns' } });
    if (s?.value) content = s.value;
  } catch {}

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="border-b border-brand-cream-dark pb-6 space-y-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-brand-burgundy">
          Customer Service
        </span>
        <h1 className="text-3xl font-serif text-brand-black">Returns & Exchange Policy</h1>
        <p className="text-xs text-brand-grey">Guaranteed peace of mind on all purchases.</p>
      </div>

      <div className="bg-white p-8 border border-brand-cream-dark space-y-6 text-sm text-brand-black/90 leading-relaxed shadow-sm">
        <p>{content}</p>

        <h3 className="text-base font-serif font-bold text-brand-black pt-4 border-t border-brand-cream-dark">
          Eligibility Requirements
        </h3>

        <ul className="list-disc pl-5 space-y-2 text-xs text-brand-grey">
          <li>Item must be unworn, undamaged, and free of perfume or stains.</li>
          <li>Original Zevyor gift box, tags, warranty card, and plastic wrappers must be intact.</li>
          <li>Exchange request must be initiated within 7 calendar days of delivery confirmation.</li>
          <li>Defective or transit-damaged items will be replaced with priority dispatch free of courier charge.</li>
        </ul>

        <div className="pt-4 border-t border-brand-cream-dark">
          <Link
            href="/contact"
            className="inline-block bg-brand-burgundy text-white text-xs uppercase tracking-widest font-semibold px-6 py-3 hover:bg-brand-burgundy-dark transition"
          >
            Initiate Exchange Request
          </Link>
        </div>
      </div>
    </div>
  );
}
