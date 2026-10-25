import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import type { Metadata } from 'next';

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { sort?: string };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await db.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category || !category.isPublished) {
    return { title: 'Category Not Found | Zevyor' };
  }

  return {
    title: `${category.name} | Zevyor Luxury Collection`,
    description: category.description || `Explore Zevyor's exclusive collection of ${category.name}. Handcrafted with unyielding standards. Cash on Delivery across Pakistan.`,
    openGraph: {
      title: `${category.name} Collection | Zevyor`,
      description: category.description || `Discover authentic ${category.name} by Zevyor.`,
      images: category.imageUrl ? [{ url: category.imageUrl }] : undefined,
    },
  };
}

export const revalidate = 30;

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = await db.category.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { status: 'PUBLISHED' },
        include: {
          images: true,
          variants: true,
          category: true,
        },
        orderBy: searchParams.sort === 'price_asc'
          ? { sellingPrice: 'asc' }
          : searchParams.sort === 'price_desc'
          ? { sellingPrice: 'desc' }
          : { createdAt: 'desc' },
      },
    },
  });

  if (!category || !category.isPublished) {
    notFound();
  }

  return (
    <div className="space-y-12 pb-16">
      {/* Category Banner / Header */}
      <section className="relative bg-brand-black text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-brand-cream-dark">
        {category.imageUrl && (
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              className="object-cover opacity-30 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/80 to-transparent" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto z-10 space-y-3">
          <div className="text-xs text-brand-cream-dark/80 uppercase tracking-widest space-x-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-white">Catalogue</Link>
            <span>/</span>
            <span className="text-brand-burgundy-light font-semibold">{category.name}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif">{category.name}</h1>
          {category.description && (
            <p className="text-sm sm:text-base text-brand-cream-dark max-w-2xl font-light leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </section>

      {/* Products & Sort Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-brand-cream-dark gap-4">
          <p className="text-xs text-brand-grey uppercase tracking-widest">
            Showing {category.products.length} products
          </p>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-brand-grey font-medium uppercase tracking-wider">Sort:</span>
            <Link
              href={`/category/${category.slug}`}
              className={`hover:text-brand-burgundy ${!searchParams.sort ? 'font-bold text-brand-burgundy' : 'text-brand-grey'}`}
            >
              Featured
            </Link>
            <Link
              href={`/category/${category.slug}?sort=price_asc`}
              className={`hover:text-brand-burgundy ${searchParams.sort === 'price_asc' ? 'font-bold text-brand-burgundy' : 'text-brand-grey'}`}
            >
              Price: Low to High
            </Link>
            <Link
              href={`/category/${category.slug}?sort=price_desc`}
              className={`hover:text-brand-burgundy ${searchParams.sort === 'price_desc' ? 'font-bold text-brand-burgundy' : 'text-brand-grey'}`}
            >
              Price: High to Low
            </Link>
          </div>
        </div>

        {category.products.length === 0 ? (
          <div className="text-center py-20 bg-white border border-brand-cream-dark mt-6">
            <h3 className="text-lg font-serif text-brand-black">No Products Currently Listed</h3>
            <p className="text-xs text-brand-grey mt-1">
              New arrivals in this category are arriving shortly.
            </p>
            <div className="mt-4">
              <Link
                href="/shop"
                className="inline-block bg-brand-burgundy text-white text-xs uppercase tracking-widest font-semibold px-6 py-3 hover:bg-brand-burgundy-dark transition"
              >
                Browse All Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {category.products.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
