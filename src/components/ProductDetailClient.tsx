'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import {
  Heart,
  ShoppingBag,
  Zap,
  MessageCircle,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  AlertCircle,
  ZoomIn,
} from 'lucide-react';

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDescription?: string | null;
    fullDescription?: string | null;
    sellingPrice: number;
    originalPrice?: number | null;
    sku?: string | null;
    trackInventory: boolean;
    category?: { name: string; slug: string } | null;
    images: { id: string; url: string; altText?: string | null; isPrimary: boolean }[];
    variants: {
      id: string;
      title: string;
      price?: number | null;
      stockQuantity: number;
      color?: string | null;
      size?: string | null;
      material?: string | null;
      imageUrl?: string | null;
    }[];
  };
  whatsappNumber?: string;
}

export default function ProductDetailClient({
  product,
  whatsappNumber = '923000000000',
}: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Selected variant
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants[0]?.id || null
  );

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  // Selected image
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const images = product.images.length > 0 ? product.images : [{ id: '1', url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000', altText: product.name, isPrimary: true }];
  const currentImage = images[activeImageIndex] || images[0];

  // Pricing & Stock
  const currentPrice = selectedVariant?.price || product.sellingPrice;
  const isSale = product.originalPrice && product.originalPrice > currentPrice;
  const stock = selectedVariant ? selectedVariant.stockQuantity : 10;
  const isOutOfStock = product.trackInventory && stock <= 0;

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id || null,
      productName: product.name,
      variantTitle: selectedVariant?.title || null,
      slug: product.slug,
      imageUrl: currentImage.url,
      price: currentPrice,
      quantity,
      stockQuantity: stock,
    });
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    handleAddToCart();
    router.push('/checkout');
  };

  // WhatsApp Order Link
  const generateWhatsAppInquiryUrl = () => {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://zevyor.com/product/${product.slug}`;
    const variantInfo = selectedVariant ? ` (${selectedVariant.title})` : '';
    const text = encodeURIComponent(
      `*Assalam-o-Alaikum Zevyor Concierge!*\n\nI am interested in ordering:\n- *Product:* ${product.name}${variantInfo}\n- *Price:* Rs. ${currentPrice.toLocaleString()}\n- *Quantity:* ${quantity}\n- *Page Reference:* ${pageUrl}\n\nPlease confirm availability and let me know how to proceed with Cash on Delivery.`
    );
    return `https://wa.me/${whatsappNumber}?text=${text}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
      {/* 1. Image Gallery */}
      <div className="space-y-4">
        {/* Main Image Display with enlargement toggle */}
        <div
          className="relative aspect-square sm:aspect-[4/5] bg-brand-cream overflow-hidden border border-brand-cream-dark cursor-zoom-in"
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <Image
            src={currentImage.url}
            alt={currentImage.altText || product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={`object-cover transition-transform duration-500 ${isZoomed ? 'scale-150' : 'hover:scale-105'}`}
          />
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-full text-brand-black shadow">
            <ZoomIn className="w-4 h-4" />
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => {
                  setActiveImageIndex(idx);
                  setIsZoomed(false);
                }}
                className={`relative w-20 h-24 flex-shrink-0 bg-brand-cream border-2 transition ${
                  activeImageIndex === idx
                    ? 'border-brand-burgundy'
                    : 'border-transparent hover:border-brand-grey-border'
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.altText || `${product.name} - view ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Product Details & Purchase Form */}
      <div className="space-y-8 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-xs text-brand-grey uppercase tracking-widest">
            {product.category && <span>{product.category.name}</span>}
            {product.sku && <span>SKU: {product.sku}</span>}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-serif text-brand-black tracking-tight">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline space-x-4">
            <span className="text-2xl sm:text-3xl font-bold text-brand-black">
              Rs. {currentPrice.toLocaleString()}
            </span>
            {isSale && (
              <span className="text-base text-brand-grey line-through">
                Rs. {product.originalPrice!.toLocaleString()}
              </span>
            )}
            {isSale && (
              <span className="bg-brand-burgundy text-white text-xs font-bold px-2 py-0.5 uppercase tracking-wider">
                Save Rs. {(product.originalPrice! - currentPrice).toLocaleString()}
              </span>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-sm text-brand-grey leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Variant Selection */}
          {product.variants.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-brand-cream-dark">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-black block">
                Select Option / Variant:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = v.id === selectedVariant?.id;
                  const vOutOfStock = product.trackInventory && v.stockQuantity <= 0;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      disabled={vOutOfStock}
                      className={`px-4 py-2.5 text-xs font-semibold tracking-wider uppercase border transition flex items-center space-x-2 ${
                        isSelected
                          ? 'border-brand-burgundy bg-brand-burgundy text-white shadow'
                          : vOutOfStock
                          ? 'border-dashed border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50'
                          : 'border-brand-grey-border bg-white text-brand-black hover:border-brand-burgundy'
                      }`}
                    >
                      <span>{v.title}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Real Stock Status */}
          <div className="pt-2">
            {isOutOfStock ? (
              <div className="flex items-center space-x-2 text-xs font-semibold text-red-600 bg-red-50 p-2.5 border border-red-200">
                <AlertCircle className="w-4 h-4" />
                <span>Currently Out of Stock. Join waitlist or inquire on WhatsApp.</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>In Stock & Ready for Courier Dispatch (Cash on Delivery)</span>
              </div>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-4 border-t border-brand-cream-dark">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-brand-grey-border bg-brand-cream-light h-12">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="px-3.5 h-full hover:bg-brand-cream text-brand-black transition disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-4 text-sm font-semibold text-brand-black">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  disabled={quantity >= stock || isOutOfStock}
                  className="px-3.5 h-full hover:bg-brand-cream text-brand-black transition disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 bg-brand-burgundy hover:bg-brand-burgundy-dark disabled:bg-gray-400 text-white h-12 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 shadow-md transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-12 h-12 flex items-center justify-center border transition ${
                  isWishlisted
                    ? 'bg-brand-burgundy text-white border-brand-burgundy'
                    : 'border-brand-grey-border text-brand-black hover:border-brand-burgundy hover:text-brand-burgundy bg-white'
                }`}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Buy Now & WhatsApp Direct Inquiry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full bg-brand-black hover:bg-brand-black-light disabled:bg-gray-400 text-white py-3.5 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 transition"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now (COD)</span>
              </button>

              <a
                href={generateWhatsAppInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white text-emerald-800 border border-emerald-600 hover:bg-emerald-50 py-3.5 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 transition"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Order via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Delivery & Assurance Guarantees */}
          <div className="bg-brand-cream-light p-5 border border-brand-cream-dark space-y-3 text-xs text-brand-black">
            <div className="flex items-start space-x-3">
              <Truck className="w-4 h-4 text-brand-burgundy flex-shrink-0 mt-0.5" />
              <div>
                <strong>Cash on Delivery Available Across Pakistan</strong>
                <p className="text-brand-grey text-[11px] mt-0.5">
                  Orders dispatched in 24 hours. Karachi/Lahore/Islamabad: 1-2 days; Nationwide: 3-5 days.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <RotateCcw className="w-4 h-4 text-brand-burgundy flex-shrink-0 mt-0.5" />
              <div>
                <strong>7-Day Inspection & Exchange Policy</strong>
                <p className="text-brand-grey text-[11px] mt-0.5">
                  Hassle-free exchange guarantee on all unworn items in original packaging.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full Specifications / Description */}
        {product.fullDescription && (
          <div className="pt-6 border-t border-brand-cream-dark space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-black">
              Product Overview & Specifications
            </h3>
            <div className="text-xs text-brand-grey leading-relaxed space-y-2">
              <p>{product.fullDescription}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
