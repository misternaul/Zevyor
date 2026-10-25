import React from 'react';
import { db } from '@/lib/db';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Zevyor',
  description: 'How Zevyor protects and handles your personal information.',
};

export default async function PrivacyPolicyPage() {
  let content =
    'Your privacy is paramount. Personal details collected at checkout (name, delivery address, phone number) are strictly used for order verification, delivery logistics, and essential status notifications.';

  try {
    const s = await db.storeSetting.findUnique({ where: { key: 'policyPrivacy' } });
    if (s?.value) content = s.value;
  } catch {}

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="border-b border-brand-cream-dark pb-6 space-y-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-brand-burgundy">
          Legal
        </span>
        <h1 className="text-3xl font-serif text-brand-black">Privacy Policy</h1>
        <p className="text-xs text-brand-grey">How we handle and protect customer information.</p>
      </div>

      <div className="bg-white p-8 border border-brand-cream-dark space-y-6 text-sm text-brand-black/90 leading-relaxed shadow-sm">
        <p>{content}</p>

        <h3 className="text-base font-serif font-bold text-brand-black pt-4 border-t border-brand-cream-dark">
          Information We Collect
        </h3>
        <p className="text-xs text-brand-grey">
          When placing a Cash on Delivery order, we collect only the necessary information to fulfill your shipment: your full name, contact mobile number, optional email for receipts, delivery street address, and city.
        </p>

        <h3 className="text-base font-serif font-bold text-brand-black pt-4 border-t border-brand-cream-dark">
          Third-Party Disclosure
        </h3>
        <p className="text-xs text-brand-grey">
          We never rent, trade, or sell customer databases to third parties. Information is shared strictly with authorized courier partners solely for the purpose of physical transit and cash collection.
        </p>
      </div>
    </div>
  );
}
