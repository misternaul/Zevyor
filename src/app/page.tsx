import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, Sparkles, Watch, Shield, Star, CheckCircle2 } from 'lucide-react';

export const revalidate = 60; // ISR cache revalidation every minute

export default async function HomePage() {
  // Fetch settings, categories, products, bundles, and lookbook from database
  let heroHeading = 'Commanding Elegance. Authentic Craft.';
  let heroSubheading =
    'Precision chronographs and artisanal cashmere shawls crafted for the modern gentleman.';
  let heroButtonText = 'Explore Collection';
  let heroButtonLink = '/shop';
  let heroImage =
    'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=2000&q=85';
  let brandIntroduction =
    'Zevyor embodies masculine refinement and architectural precision. Each piece is designed for discerning individuals who appreciate quiet luxury, enduring quality, and confident individuality.';

  try {
    const settings = await db.storeSetting.findMany({
      where: {
        key: {
          in: [
            'heroHeading',
            'heroSubheading',
            'heroButtonText',
            'heroButtonLink',
            'heroImageDesktop',
            'brandIntroduction',
          ],
        },
      },
    });

    for (const s of settings) {
      if (s.key === 'heroHeading') heroHeading = s.value;
      if (s.key === 'heroSubheading') heroSubheading = s.value;
      if (s.key === 'heroButtonText') heroButtonText = s.value;
      if (s.key === 'heroButtonLink') heroButtonLink = s.value;
      if (s.key === 'heroImageDesktop') heroImage = s.value;
      if (s.key === 'brandIntroduction') brandIntroduction = s.value;
    }
  } catch (err) {}

  const [categories, featuredProducts, newArrivals, bundles, lookbookEntries, approvedReviews] =
    await Promise.all([
      db.category.findMany({
        where: { isPublished: true },
        orderBy: { displayOrder: 'asc' },
        include: { _count: { select: { products: true } } },
      }),
      db.product.findMany({
        where: { status: 'PUBLISHED', isFeatured: true },
        include: { images: true, variants: true, category: true },
        take: 4,
      }),
      db.product.findMany({
        where: { status: 'PUBLISHED', isNewArrival: true },
        include: { images: true, variants: true, category: true },
        take: 4,
      }),
      db.bundle.findMany({
        where: { isActive: true },
        take: 2,
      }),
      db.lookbookEntry.findMany({
        where: { isPublished: true },
        orderBy: { displayOrder: 'asc' },
        take: 2,
      }),
      db.productReview.findMany({
        where: { isApproved: true },
        include: { product: true },
        take: 3,
      }),
    ]);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative h-[85vh] min-h-[580px] max-h-[850px] w-full bg-brand-black overflow-hidden flex items-center">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="Zevyor Lifestyle Collection"
            fill
            priority
            className="object-cover object-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/70 to-transparent" />
        </div>

        {/* Hero Typography & CTA */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-burgundy/30 border border-brand-burgundy text-brand-cream-light text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-brand-burgundy-light" />
              <span>Lifestyle & Horology • Pakistan</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-white tracking-tight leading-[1.1]">
              {heroHeading}
            </h1>

            <p className="text-brand-cream-dark text-base sm:text-lg font-light leading-relaxed max-w-xl">
              {heroSubheading}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                href={heroButtonLink}
                className="inline-flex items-center justify-center space-x-3 bg-brand-burgundy hover:bg-brand-burgundy-dark text-white px-8 py-4 text-xs font-semibold uppercase tracking-widest shadow-xl transition-all duration-300 hover:translate-y-[-2px]"
              >
                <span>{heroButtonText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/category/shawls"
                className="inline-flex items-center justify-center space-x-2 bg-transparent hover:bg-white/10 text-brand-cream border border-brand-cream-dark/40 px-8 py-4 text-xs font-semibold uppercase tracking-widest transition-all duration-300"
              >
                <span>Explore Shawls</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brand Introduction Editorial */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-brand-burgundy">
          The Zevyor Philosophy
        </h2>
        <p className="text-xl sm:text-2xl font-serif text-brand-black leading-relaxed">
          &ldquo;{brandIntroduction}&rdquo;
        </p>
        <div className="w-16 h-0.5 bg-brand-burgundy mx-auto mt-4" />
      </section>

      {/* 3. Curated Product Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-burgundy">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-brand-black mt-1">
              Select Your Category
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative h-96 overflow-hidden bg-brand-black flex items-end p-8 border border-brand-cream-dark transition-all duration-500 shadow-sm hover:shadow-xl"
            >
              <Image
                src={
                  cat.imageUrl ||
                  (cat.slug === 'watches'
                    ? 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80'
                    : 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=80')
                }
                alt={cat.name}
                fill
                className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="relative z-10 text-white space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-brand-burgundy-light">
                  {cat._count.products} Products Available
                </span>
                <h3 className="text-2xl font-serif">{cat.name}</h3>
                {cat.description && (
                  <p className="text-xs text-brand-cream-dark max-w-md line-clamp-2">
                    {cat.description}
                  </p>
                )}
                <div className="pt-2 flex items-center space-x-2 text-xs font-semibold tracking-widest uppercase text-white group-hover:text-brand-burgundy-light transition-colors">
                  <span>Explore {cat.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Masterpieces */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-burgundy">
                Selected by Zevyor
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-brand-black mt-1">
                Featured Highlights
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-semibold tracking-widest uppercase text-brand-black hover:text-brand-burgundy transition flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Promotional Bundle Offer */}
      {bundles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-burgundy text-white p-8 sm:p-12 lg:p-16 border border-brand-burgundy-dark shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-black/10 pointer-events-none" />
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="inline-block bg-white text-brand-burgundy px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
                Exclusive Bundle Offer
              </span>
              <h3 className="text-2xl sm:text-4xl font-serif text-white">
                {bundles[0].title}
              </h3>
              <p className="text-brand-cream text-sm leading-relaxed">
                {bundles[0].description}
              </p>
              <div className="pt-2">
                <Link
                  href="/category/watches"
                  className="inline-flex items-center space-x-2 bg-white text-brand-black hover:bg-brand-cream px-6 py-3.5 text-xs font-semibold uppercase tracking-widest transition"
                >
                  <span>Build Your Bundle</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-burgundy">
                Just Arrived
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-brand-black mt-1">
                New Additions
              </h2>
            </div>
            <Link
              href="/shop?sort=newest"
              className="text-xs font-semibold tracking-widest uppercase text-brand-black hover:text-brand-burgundy transition flex items-center space-x-1"
            >
              <span>View New</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Editorial Lookbook Teaser */}
      {lookbookEntries.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-burgundy">
              Visual Campaign
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-brand-black">
              The Editorial Lookbook
            </h2>
            <p className="text-xs text-brand-grey">
              A curated photographic study of presence, styling, and material textures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {lookbookEntries.map((lb) => (
              <div key={lb.id} className="space-y-4 group">
                <div className="relative aspect-[16/10] bg-brand-cream overflow-hidden border border-brand-cream-dark">
                  <Image
                    src={lb.imageUrl}
                    alt={lb.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-serif text-brand-black group-hover:text-brand-burgundy transition-colors">
                    {lb.title}
                  </h4>
                  {lb.caption && (
                    <p className="text-xs text-brand-grey mt-1 leading-relaxed">{lb.caption}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/lookbook"
              className="inline-flex items-center space-x-2 border-b-2 border-brand-black pb-1 text-xs font-semibold uppercase tracking-widest hover:text-brand-burgundy hover:border-brand-burgundy transition-colors"
            >
              <span>Explore Complete Campaign</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* 8. Genuine Customer Reviews (Only if approved reviews exist) */}
      {approvedReviews.length > 0 && (
        <section className="bg-white py-16 border-y border-brand-cream-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-burgundy">
                Client Experiences
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-brand-black">
                Verified Customer Feedback
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {approvedReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-brand-cream-light p-6 border border-brand-cream-dark flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-1 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-brand-black/80 italic leading-relaxed">
                      &ldquo;{rev.reviewText}&rdquo;
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-brand-cream-dark flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-brand-black">{rev.customerName}</h5>
                      <p className="text-[10px] text-brand-grey">{rev.product?.name}</p>
                    </div>
                    {rev.isVerifiedPurchase && (
                      <span className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
