'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { X, Trash2, Plus, Minus, ShoppingBag, MessageSquare, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  whatsappNumber?: string;
}

export default function CartDrawer({ whatsappNumber = '923000000000' }: CartDrawerProps) {
  const {
    items,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeItem,
    updateQuantity,
    subtotal,
    itemCount,
  } = useCart();

  if (!isCartDrawerOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 5000;
  const progressToFreeShipping = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  // Generate WhatsApp cart inquiry link
  const generateWhatsAppMessage = () => {
    let msg = `*Assalam-o-Alaikum Zevyor Concierge!*\n\nI would like to inquire about ordering the following items from your catalogue:\n\n`;
    items.forEach((item, index) => {
      msg += `${index + 1}. *${item.productName}*`;
      if (item.variantTitle) msg += ` (${item.variantTitle})`;
      msg += `\n   Qty: ${item.quantity} × Rs. ${item.price.toLocaleString()} = Rs. ${(item.quantity * item.price).toLocaleString()}\n`;
    });
    msg += `\n*Cart Total:* Rs. ${subtotal.toLocaleString()}`;
    msg += `\n*Payment Preference:* Cash on Delivery`;
    msg += `\n\n*(Note: This is an inquiry from my shopping cart. Please confirm product availability and delivery details).*`;

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-brand-cream-dark flex items-center justify-between bg-brand-cream-light">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-brand-burgundy" />
              <h2 className="text-lg font-serif tracking-wider uppercase text-brand-black">
                Your Shopping Bag ({itemCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 text-brand-grey hover:text-brand-black transition"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-white px-6 py-3 border-b border-brand-cream-dark">
            <div className="text-xs text-brand-black font-medium mb-1.5 flex justify-between">
              {remainingForFreeShipping > 0 ? (
                <span>
                  Add <strong className="text-brand-burgundy">Rs. {remainingForFreeShipping.toLocaleString()}</strong> more for complimentary delivery!
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold flex items-center">
                  ✔ You unlocked Complimentary Nationwide Delivery!
                </span>
              )}
              <span className="text-brand-grey">{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="w-full bg-brand-cream-dark h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-burgundy h-full transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-brand-cream-dark">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                <div className="w-16 h-16 rounded-full bg-brand-cream flex items-center justify-center text-brand-grey">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-medium text-brand-black">Your bag is empty</h3>
                <p className="text-xs text-brand-grey max-w-xs">
                  Explore our collection of precision timepieces and artisanal shawls.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="mt-2 inline-block bg-brand-burgundy text-white text-xs uppercase tracking-widest font-semibold px-6 py-3 hover:bg-brand-burgundy-dark transition"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || 'default'}`}
                  className="pt-4 first:pt-0 flex space-x-4"
                >
                  {/* Image */}
                  <div className="relative w-20 h-24 bg-brand-cream flex-shrink-0 border border-brand-cream-dark overflow-hidden">
                    <Image
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=200'}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={() => setIsCartDrawerOpen(false)}
                          className="text-sm font-medium text-brand-black hover:text-brand-burgundy line-clamp-1"
                        >
                          {item.productName}
                        </Link>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-brand-grey hover:text-red-600 transition p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {item.variantTitle && (
                        <p className="text-xs text-brand-grey mt-0.5">{item.variantTitle}</p>
                      )}

                      <p className="text-xs font-semibold text-brand-black mt-1">
                        Rs. {item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-2 mt-3">
                      <div className="flex items-center border border-brand-grey-border bg-brand-cream-light">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.variantId, item.quantity - 1)
                          }
                          className="p-1 hover:bg-brand-cream text-brand-black transition"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-brand-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.variantId, item.quantity + 1)
                          }
                          className="p-1 hover:bg-brand-cream text-brand-black transition"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs text-brand-grey ml-auto">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Controls */}
          {items.length > 0 && (
            <div className="p-6 border-t border-brand-cream-dark bg-brand-cream-light space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-brand-grey uppercase tracking-wider font-medium text-xs">
                  Estimated Subtotal
                </span>
                <span className="text-base font-bold text-brand-black">
                  Rs. {subtotal.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-brand-grey leading-tight">
                Shipping, regional delivery rules, and coupons are calculated during checkout.
              </p>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-full flex items-center justify-center space-x-2 bg-brand-burgundy text-white py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-brand-burgundy-dark transition shadow-md"
              >
                <span>Proceed to Checkout (COD)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* WhatsApp Ordering Button */}
              <a
                href={generateWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 bg-white text-emerald-800 border border-emerald-600 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-emerald-50 transition"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Inquire / Order via WhatsApp</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
