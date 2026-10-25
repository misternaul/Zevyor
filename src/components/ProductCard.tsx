'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  sellingPrice: number;
  originalPrice?: number | null;
  category?: { name: string; slug: string } | null;
  images: { url: string; altText?: string | null }[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  variants?: { id: string; title: string; stockQuantity: number; price?: number | null }[];
  trackInventory?: boolean;
}

export default function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const primaryImage =
    product.images[0]?.url ||
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80';

  const secondaryImage = product.images[1]?.url || primaryImage;

  const isSale = product.originalPrice && product.originalPrice > product.sellingPrice;
  const isWishlisted = isInWishlist(product.id);

  // Check total stock across variants
  const totalStock = product.variants?.reduce((sum, v) => sum + v.stockQuantity, 0) ?? 10;
  const isOutOfStock = product.trackInventory && totalStock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    const defaultVariant = product.variants?.[0];
    addItem({
      productId: product.id,
      variantId: defaultVariant?.id || null,
      productName: product.name,
      variantTitle: defaultVariant?.title || null,
      slug: product.slug,
      imageUrl: primaryImage,
      price: defaultVariant?.price || product.sellingPrice,
      quantity: 1,
      stockQuantity: defaultVariant?.stockQuantity ?? 10,
    });
  };

  return (
    <div className="group relative flex flex-col bg-white border border-brand-cream-dark transition-all duration-300 hover:shadow-lg">
      {/* Product Image Container */}
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-brand-cream">
        <Image
          src={primaryImage}
          alt={product.images[0]?.altText || product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1 z-10">
          {isSale && (
            <span className="bg-brand-burgundy text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              Sale
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-brand-black text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              Bestseller
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-brand-cream-dark text-brand-black text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              New Arrival
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-neutral-800 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors z-10 ${
            isWishlisted
              ? 'bg-brand-burgundy text-white'
              : 'bg-white/80 text-brand-black hover:bg-white hover:text-brand-burgundy'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add Overlay on hover (Desktop) */}
        {!isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
            <button
              onClick={handleQuickAdd}
              className="w-full bg-white text-brand-black py-2.5 px-4 text-xs font-semibold uppercase tracking-wider hover:bg-brand-burgundy hover:text-white transition flex items-center justify-center space-x-1.5 shadow"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Quick Add to Bag</span>
            </button>
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {product.category && (
            <p className="text-[11px] text-brand-grey uppercase tracking-widest font-medium mb-1">
              {product.category.name}
            </p>
          )}

          <h3 className="text-sm font-medium text-brand-black line-clamp-1 group-hover:text-brand-burgundy transition-colors">
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
        </div>

        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-sm font-bold text-brand-black">
            Rs. {product.sellingPrice.toLocaleString()}
          </span>
          {isSale && (
            <span className="text-xs text-brand-grey line-through">
              Rs. {product.originalPrice!.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
