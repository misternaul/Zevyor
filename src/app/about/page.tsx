import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ShieldCheck, Sparkles, Gem, Clock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Heritage & Philosophy | Zevyor',
  description: 'Learn about the philosophy, materials, and artisan craftsmanship behind Zevyor lifestyle accessories.',
};

export default async function AboutPage() {
  let brandIntro =
    'Zevyor was created to fulfill a singular design imperative: crafting bold, masculine lifestyle pieces that balance technical precision with distinguished elegance. Our journey begins with curated chronographs and Himalayan cashmere shawls designed for discerning individuals.';

  try {
    const s = await db.storeSetting.findUnique({ where: { key: 'brandIntroduction' } });
    if (s?.value) brandIntro = s.value;
  } catch {}

  return (
    <div className="space-y-16 py-12">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <span className="text-xs font-semibold tracking-widest uppercase text-brand-burgundy">
          Brand Heritage
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif text-brand-black">
          The Art of Modern Presence
        </h1>
        <p className="text-sm sm:text-base text-brand-grey leading-relaxed max-w-2xl mx-auto font-light">
          {brandIntro}
        </p>
        <div className="w-16 h-0.5 bg-brand-burgundy mx-auto mt-4" />
      </section>

      {/* Visual Editorial Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 border border-brand-cream-dark space-y-4">
            <Gem className="w-8 h-8 text-brand-burgundy" />
            <h3 className="text-lg font-serif text-brand-black">Uncompromised Materials</h3>
            <p className="text-xs text-brand-grey leading-relaxed">
              From pure Himalayan pashmina wool harvested at high altitudes to 316L surgical-grade stainless steel and anti-reflective sapphire crystals, our material standards remain uncompromising.
            </p>
          </div>

          <div className="bg-white p-8 border border-brand-cream-dark space-y-4">
            <Clock className="w-8 h-8 text-brand-burgundy" />
            <h3 className="text-lg font-serif text-brand-black">Enduring Design</h3>
            <p className="text-xs text-brand-grey leading-relaxed">
              We reject transient micro-trends. Every chronograph bezel and every woven border is proportioned for enduring authority that commands attention today, tomorrow, and decades into the future.
            </p>
          </div>

          <div className="bg-white p-8 border border-brand-cream-dark space-y-4">
            <ShieldCheck className="w-8 h-8 text-brand-burgundy" />
            <h3 className="text-lg font-serif text-brand-black">Authentic Reliability</h3>
            <p className="text-xs text-brand-grey leading-relaxed">
              Every order placed with Zevyor is supported by our dedicated concierge service, nationwide Cash on Delivery, open inspection, and guaranteed 7-day exchange protection.
            </p>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-4 pt-8">
        <h2 className="text-2xl font-serif text-brand-black">Experience Zevyor</h2>
        <div className="flex justify-center space-x-4 pt-2">
          <Link
            href="/category/watches"
            className="bg-brand-burgundy text-white text-xs uppercase tracking-widest font-semibold px-6 py-3.5 hover:bg-brand-burgundy-dark transition"
          >
            Explore Watches
          </Link>
          <Link
            href="/category/shawls"
            className="bg-brand-black text-white text-xs uppercase tracking-widest font-semibold px-6 py-3.5 hover:bg-brand-black-light transition"
          >
            Explore Shawls
          </Link>
        </div>
      </section>
    </div>
  );
}
