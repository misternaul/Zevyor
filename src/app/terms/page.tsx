import React from 'react';
import { db } from '@/lib/db';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Zevyor',
  description: 'Terms of sale, Cash on Delivery conditions, and catalogue integrity for Zevyor.',
};

export default async function TermsPage() {
  let content =
    'All products listed are guaranteed authentic. Prices are stated in Pakistani Rupees (PKR) and include applicable taxes. We reserve the right to verify orders by phone prior to dispatch.';

  try {
    const s = await db.storeSetting.findUnique({ where: { key: 'policyTerms' } });
    if (s?.value) content = s.value;
  } catch {}

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="border-b border-brand-cream-dark pb-6 space-y-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-brand-burgundy">
          Legal
        </span>
        <h1 className="text-3xl font-serif text-brand-black">Terms & Conditions</h1>
        <p className="text-xs text-brand-grey">Operating principles and conditions of service.</p>
      </div>

      <div className="bg-white p-8 border border-brand-cream-dark space-y-6 text-sm text-brand-black/90 leading-relaxed shadow-sm">
        <p>{content}</p>

        <h3 className="text-base font-serif font-bold text-brand-black pt-4 border-t border-brand-cream-dark">
          Order Acceptance & Verification
        </h3>
        <p className="text-xs text-brand-grey">
          Submission of an order through our website constitutes an offer to purchase under Cash on Delivery terms. Zevyor reserves the right to contact the customer via phone or WhatsApp to re-verify destination credentials prior to dispatch.
        </p>

        <h3 className="text-base font-serif font-bold text-brand-black pt-4 border-t border-brand-cream-dark">
          Pricing & Availability
        </h3>
        <p className="text-xs text-brand-grey">
          All prices are quoted in Pakistani Rupees (PKR). In the rare event of an unforeseen typographical pricing error or inventory discrepancy, we will notify you before shipping.
        </p>
      </div>
    </div>
  );
}
