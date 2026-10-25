import React from 'react';
import { db } from '@/lib/db';
import { MessageCircle, Mail, Phone, Clock, MapPin } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Concierge | Zevyor',
  description: 'Reach Zevyor customer care directly on WhatsApp or email for inquiries and assistance.',
};

export default async function ContactPage() {
  let whatsappNumber = '923000000000';
  let contactEmail = 'support@zevyor.com';

  try {
    const settings = await db.storeSetting.findMany({
      where: { key: { in: ['whatsappNumber', 'contactEmail'] } },
    });
    for (const s of settings) {
      if (s.key === 'whatsappNumber') whatsappNumber = s.value;
      if (s.key === 'contactEmail') contactEmail = s.value;
    }
  } catch {}

  const defaultMsg = encodeURIComponent(
    'Assalam-o-Alaikum Zevyor Concierge! I have an inquiry regarding your collections and ordering.'
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-semibold tracking-widest uppercase text-brand-burgundy">
          Client Care
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-brand-black">Contact Concierge</h1>
        <p className="text-xs text-brand-grey max-w-md mx-auto">
          Our team is available to assist you with styling recommendations, order tracking, and custom requests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* WhatsApp Card */}
        <div className="bg-emerald-50 border border-emerald-200 p-8 space-y-5 text-center flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
              <MessageCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-serif text-emerald-950">WhatsApp Concierge</h2>
            <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
              Fastest response time. Chat directly with our product specialists regarding stock, sizing, or expedited order fulfillment.
            </p>
          </div>

          <div>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${defaultMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 text-xs uppercase tracking-widest font-semibold shadow transition"
            >
              Start WhatsApp Chat
            </a>
            <p className="text-[11px] text-emerald-700 mt-2 font-mono">+{whatsappNumber}</p>
          </div>
        </div>

        {/* Email & Hours */}
        <div className="bg-white border border-brand-cream-dark p-8 space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-3">
              Direct Contact Channels
            </h2>

            <div className="flex items-start space-x-3 text-xs text-brand-black">
              <Mail className="w-4 h-4 text-brand-burgundy flex-shrink-0 mt-0.5" />
              <div>
                <strong>Support & Inquiries Email:</strong>
                <p className="text-brand-grey mt-0.5 font-mono">{contactEmail}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs text-brand-black">
              <Clock className="w-4 h-4 text-brand-burgundy flex-shrink-0 mt-0.5" />
              <div>
                <strong>Operating Hours:</strong>
                <p className="text-brand-grey mt-0.5">Monday to Saturday: 10:00 AM – 8:00 PM (PKT)</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs text-brand-black">
              <MapPin className="w-4 h-4 text-brand-burgundy flex-shrink-0 mt-0.5" />
              <div>
                <strong>Fulfillment Hubs:</strong>
                <p className="text-brand-grey mt-0.5">Karachi & Lahore, Pakistan (Nationwide Courier Dispatch)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
