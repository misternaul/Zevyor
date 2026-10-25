import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import { Filter, SlidersHorizontal, Search, RotateCcw } from 'lucide-react';

interface ShopPageProps {
  searchParams: {
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    inStock?: string;
  };
}

export const revalidate = 30;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { q, category, minPrice, maxPrice, sort, inStock } = searchParams;

  // Build Prisma where query
  const where: any = {
    status: 'PUBLISHED',
  };

  if (q && q.trim()) {
    where.OR = [
      { name: { contains: q.trim() } },
      { shortDescription: { contains: q.trim() } },
      { fullDescription: { contains: q.trim() } },
      { tags: { contains: q.trim() } },
      { sku: { contains: q.trim() } },
    ];
  }

  if (category) {
    where.category = {
      slug: category,
    };
  }

  const minP = minPrice ? parseInt(minPrice, 10) : undefined;
  const maxP = maxPrice ? parseInt(maxPrice, 10) : undefined;

  if (minP || maxP) {
    where.sellingPrice = {};
    if (minP) where.sellingPrice.gte = minP;
    if (maxP) where.sellingPrice.lte = maxP;
  }

  // Sorting
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { sellingPrice: 'asc' };
  if (sort === 'price_desc') orderBy = { sellingPrice: 'desc' };
  if (sort === 'popular') orderBy = { isBestseller: 'desc' };

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      include: {
        images: true,
        variants: true,
        category: true,
      },
    }),
    db.category.findMany({
      where: { isPublished: true },
      include: {
        _count: {
          select: { products: { where: { status: 'PUBLISHED' } } },
        },
      },
    }),
  ]);

  // Filter inStock in memory if requested
  const filteredProducts = inStock === 'true'
    ? products.filter((p) => {
        const total = p.variants.reduce((s, v) => s + v.stockQuantity, 0);
        return !p.trackInventory || total > 0;
      })
    : products;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Title & Breadcrumb */}
      <div className="border-b border-brand-cream-dark pb-6 mb-8">
        <div className="text-xs text-brand-grey uppercase tracking-widest space-x-2">
          <Link href="/" className="hover:text-brand-black">Home</Link>
          <span>/</span>
          <span className="text-brand-burgundy font-semibold">Catalogue</span>
          {category && (
            <>
              <span>/</span>
              <span className="capitalize">{category}</span>
            </>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif text-brand-black mt-2">
          {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Collection` : 'All Collections'}
        </h1>
        <p className="text-xs text-brand-grey mt-1">
          Showing {filteredProducts.length} handcrafted timepieces and luxury apparel items.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="space-y-6 lg:border-r lg:border-brand-cream-dark lg:pr-8">
          <div className="flex items-center justify-between border-b border-brand-cream-dark pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-black flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Catalogue</span>
            </span>
            {(q || category || minPrice || maxPrice || sort || inStock) && (
              <Link
                href="/shop"
                className="text-[11px] text-brand-burgundy font-semibold hover:underline flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </Link>
            )}
          </div>

          {/* Categories Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-black">
              Categories
            </h4>
            <div className="space-y-1.5 text-xs">
              <Link
                href={`/shop${q ? `?q=${q}` : ''}`}
                className={`block py-1 transition ${
                  !category ? 'font-bold text-brand-burgundy' : 'text-brand-grey hover:text-brand-black'
                }`}
              >
                All Categories
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}${q ? `&q=${q}` : ''}`}
                  className={`flex justify-between py-1 transition ${
                    category === cat.slug ? 'font-bold text-brand-burgundy' : 'text-brand-grey hover:text-brand-black'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] text-brand-grey-light">({cat._count.products})</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Sort Filter */}
          <div className="space-y-3 pt-4 border-t border-brand-cream-dark">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-black">
              Sort By
            </h4>
            <div className="space-y-1.5 text-xs text-brand-grey">
              <Link
                href={`/shop?${new URLSearchParams({ ...searchParams, sort: 'newest' }).toString()}`}
                className={`block py-1 hover:text-brand-black ${sort === 'newest' || !sort ? 'font-bold text-brand-burgundy' : ''}`}
              >
                Newest Arrivals
              </Link>
              <Link
                href={`/shop?${new URLSearchParams({ ...searchParams, sort: 'popular' }).toString()}`}
                className={`block py-1 hover:text-brand-black ${sort === 'popular' ? 'font-bold text-brand-burgundy' : ''}`}
              >
                Bestsellers
              </Link>
              <Link
                href={`/shop?${new URLSearchParams({ ...searchParams, sort: 'price_asc' }).toString()}`}
                className={`block py-1 hover:text-brand-black ${sort === 'price_asc' ? 'font-bold text-brand-burgundy' : ''}`}
              >
                Price: Low to High
              </Link>
              <Link
                href={`/shop?${new URLSearchParams({ ...searchParams, sort: 'price_desc' }).toString()}`}
                className={`block py-1 hover:text-brand-black ${sort === 'price_desc' ? 'font-bold text-brand-burgundy' : ''}`}
              >
                Price: High to Low
              </Link>
            </div>
          </div>

          {/* Availability Filter */}
          <div className="space-y-3 pt-4 border-t border-brand-cream-dark">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-black">
              Availability
            </h4>
            <div className="space-y-1.5 text-xs text-brand-grey">
              <Link
                href={`/shop?${new URLSearchParams({ ...searchParams, inStock: inStock === 'true' ? '' : 'true' }).toString()}`}
                className={`flex items-center space-x-2 py-1 ${inStock === 'true' ? 'font-bold text-brand-burgundy' : 'hover:text-brand-black'}`}
              >
                <input
                  type="checkbox"
                  checked={inStock === 'true'}
                  readOnly
                  className="rounded border-brand-grey text-brand-burgundy focus:ring-brand-burgundy"
                />
                <span>In Stock Only</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white p-12 border border-brand-cream-dark text-center space-y-4">
              <Search className="w-10 h-10 text-brand-grey mx-auto" />
              <h3 className="text-lg font-serif text-brand-black">No Products Match Your Criteria</h3>
              <p className="text-xs text-brand-grey max-w-sm mx-auto">
                Try adjusting your search terms or clearing your filters to discover our available collections.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-block bg-brand-burgundy text-white text-xs uppercase tracking-widest font-semibold px-6 py-3 hover:bg-brand-burgundy-dark transition"
                >
                  Clear All Filters
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
