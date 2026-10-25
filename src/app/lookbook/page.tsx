import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/db';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campaign Lookbook | Zevyor Editorial',
  description: 'Explore the visual editorial world of Zevyor. High-fashion photography showcasing luxury timepieces and hand-crafted shawls.',
};

export const revalidate = 60;

export default async function LookbookPage() {
  const entries = await db.lookbookEntry.findMany({
    where: { isPublished: true },
    orderBy: { displayOrder: 'asc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-semibold tracking-widest uppercase text-brand-burgundy">
          Autumn / Winter Campaign
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif text-brand-black">
          The Zevyor Lookbook
        </h1>
        <p className="text-sm text-brand-grey leading-relaxed">
          An ongoing visual exploration of architecture, restraint, and distinguished masculine character.
        </p>
        <div className="w-16 h-0.5 bg-brand-burgundy mx-auto mt-4" />
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20 bg-white border border-brand-cream-dark">
          <p className="text-sm text-brand-grey">Campaign photos arriving shortly.</p>
        </div>
      ) : (
        <div className="space-y-24">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div
                className={`lg:col-span-8 relative aspect-[16/10] bg-brand-cream overflow-hidden border border-brand-cream-dark shadow-md ${
                  index % 2 === 1 ? 'lg:order-2' : 'lg:order-1'
                }`}
              >
                <Image
                  src={entry.imageUrl}
                  alt={entry.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div
                className={`lg:col-span-4 space-y-4 p-4 ${
                  index % 2 === 1 ? 'lg:order-1' : 'lg:order-2'
                }`}
              >
                <span className="text-[11px] font-mono uppercase tracking-widest text-brand-grey">
                  Exhibit 0{index + 1}
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-brand-black">
                  {entry.title}
                </h2>
                {entry.caption && (
                  <p className="text-xs text-brand-grey leading-relaxed">
                    {entry.caption}
                  </p>
                )}
                <div className="pt-2">
                  <Link
                    href="/shop"
                    className="inline-block border-b-2 border-brand-black pb-1 text-xs font-semibold uppercase tracking-widest hover:text-brand-burgundy hover:border-brand-burgundy transition"
                  >
                    View Associated Pieces
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
