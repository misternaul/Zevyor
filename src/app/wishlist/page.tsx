'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/lib/wishlist-context';
import { useCart } from '@/lib/cart-context';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  sellingPrice: number;
  originalPrice?: number | null;
  images: { url: string }[];
  category?: { name: string } | null;
}

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlistProducts() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/products/batch?ids=${wishlistIds.join(',')}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (e) {
        console.error('Failed to load wishlist:', e);
      } finally {
        setLoading(false);
      }
    }

    loadWishlistProducts();
  }, [wishlistIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-brand-cream-dark pb-6">
        <h1 className="text-3xl font-serif text-brand-black">Your Curated Wishlist</h1>
        <p className="text-xs text-brand-grey mt-1">
          Saved favorites for your personal consideration. Preserved in your current browser session.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-brand-grey">Loading saved pieces...</div>
      ) : products.length === 0 ? (
        <div className="bg-white p-16 border border-brand-cream-dark text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-brand-cream flex items-center justify-center mx-auto text-brand-grey">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-serif text-brand-black">Your Wishlist is Empty</h2>
          <p className="text-xs text-brand-grey max-w-sm mx-auto">
            Explore our collections and click the heart icon on any piece to save it for later review.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-block bg-brand-burgundy text-white text-xs uppercase tracking-widest font-semibold px-6 py-3 hover:bg-brand-burgundy-dark transition"
            >
              Explore Collections
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => {
            const imgUrl = p.images[0]?.url || 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400';
            return (
              <div
                key={p.id}
                className="bg-white border border-brand-cream-dark flex flex-col justify-between group"
              >
                <div className="relative aspect-[4/5] bg-brand-cream overflow-hidden">
                  <Image src={imgUrl} alt={p.name} fill className="object-cover" />
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-red-600 rounded-full shadow transition"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    {p.category && (
                      <p className="text-[10px] text-brand-grey uppercase tracking-widest">
                        {p.category.name}
                      </p>
                    )}
                    <h3 className="text-sm font-semibold text-brand-black line-clamp-1">
                      <Link href={`/product/${p.slug}`}>{p.name}</Link>
                    </h3>
                    <p className="text-xs font-bold text-brand-black mt-1">
                      Rs. {p.sellingPrice.toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      addItem({
                        productId: p.id,
                        productName: p.name,
                        slug: p.slug,
                        imageUrl: imgUrl,
                        price: p.sellingPrice,
                        quantity: 1,
                        stockQuantity: 10,
                      });
                    }}
                    className="w-full bg-brand-burgundy hover:bg-brand-burgundy-dark text-white py-2.5 text-xs uppercase tracking-wider font-semibold flex items-center justify-center space-x-1.5 transition"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
