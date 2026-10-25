import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import ProductDetailClient from '@/components/ProductDetailClient';
import ProductCard from '@/components/ProductCard';
import type { Metadata } from 'next';
import { Star } from 'lucide-react';

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: { images: true, category: true },
  });

  if (!product || product.status !== 'PUBLISHED') {
    return { title: 'Product Not Found | Zevyor' };
  }

  const primaryImage = product.images[0]?.url;

  return {
    title: product.seoTitle || `${product.name} | Zevyor Luxury Lifestyle`,
    description:
      product.seoDescription ||
      product.shortDescription ||
      `Shop ${product.name} by Zevyor. Handcrafted with precision. Cash on Delivery across Pakistan.`,
    openGraph: {
      title: product.name,
      description: product.shortDescription || undefined,
      images: primaryImage ? [{ url: primaryImage }] : undefined,
    },
  };
}

export const revalidate = 30;

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: { displayOrder: 'asc' } },
      variants: true,
      category: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product || product.status !== 'PUBLISHED') {
    notFound();
  }

  // Related products from same category
  const relatedProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: 'PUBLISHED',
    },
    include: {
      images: true,
      variants: true,
      category: true,
    },
    take: 4,
  });

  // Get WhatsApp number from settings
  let whatsappNumber = '923000000000';
  try {
    const s = await db.storeSetting.findUnique({ where: { key: 'whatsappNumber' } });
    if (s?.value) whatsappNumber = s.value;
  } catch {}

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((i) => i.url),
    description: product.shortDescription || product.fullDescription,
    sku: product.sku || undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: product.sellingPrice,
      availability:
        product.variants.reduce((acc, v) => acc + v.stockQuantity, 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-brand-grey uppercase tracking-widest space-x-2">
        <Link href="/" className="hover:text-brand-black">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-brand-black">Catalogue</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/category/${product.category.slug}`} className="hover:text-brand-black">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-brand-burgundy font-semibold">{product.name}</span>
      </nav>

      {/* Main Interactive Product Section */}
      <ProductDetailClient product={product as any} whatsappNumber={whatsappNumber} />

      {/* Customer Reviews Section */}
      {product.reviews.length > 0 && (
        <section className="pt-12 border-t border-brand-cream-dark space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-brand-burgundy">
                Client Testimonials
              </span>
              <h2 className="text-2xl font-serif text-brand-black mt-1">Customer Reviews</h2>
            </div>
            <span className="text-xs text-brand-grey font-medium">
              {product.reviews.length} Verified Reviews
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.reviews.map((r) => (
              <div key={r.id} className="bg-white p-6 border border-brand-cream-dark space-y-3">
                <div className="flex items-center space-x-1 text-amber-500">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-brand-black/80 leading-relaxed italic">
                  &ldquo;{r.reviewText}&rdquo;
                </p>
                <div className="pt-2 text-xs font-bold text-brand-black flex items-center justify-between">
                  <span>{r.customerName}</span>
                  {r.isVerifiedPurchase && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                      Verified Purchase
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-brand-cream-dark space-y-6">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-burgundy">
              Curated Recommendations
            </span>
            <h2 className="text-2xl font-serif text-brand-black mt-1">Complementary Pieces</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
