'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { ShoppingBag, Heart, Search, Menu, X, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  announcementText?: string;
  announcementVisible?: boolean;
}

export default function Header({
  announcementText = 'Complimentary Nationwide Delivery on Orders Above Rs. 5,000 | Cash on Delivery Available',
  announcementVisible = true,
}: HeaderProps) {
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-brand-cream-dark transition-all">
      {/* Announcement Bar */}
      {announcementVisible && (
        <div className="bg-brand-black text-brand-cream py-2 px-4 text-xs tracking-wider uppercase text-center font-medium flex items-center justify-center space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-burgundy-light inline-block" />
          <span>{announcementText}</span>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-brand-black hover:text-brand-burgundy transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Navigation Links (Left) */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium tracking-widest uppercase">
            <Link
              href="/category/watches"
              className="text-brand-black hover:text-brand-burgundy transition-colors duration-200"
            >
              Watches
            </Link>
            <Link
              href="/category/shawls"
              className="text-brand-black hover:text-brand-burgundy transition-colors duration-200"
            >
              Shawls
            </Link>
            <Link
              href="/shop"
              className="text-brand-black hover:text-brand-burgundy transition-colors duration-200"
            >
              Shop All
            </Link>
          </nav>

          {/* Centered Brand Logo */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <Link href="/" className="flex items-center py-2 group">
              <div className="relative h-12 w-36 sm:w-44 flex items-center justify-center">
                <Image
                  src="/assets/zevyor-official-logo.png"
                  alt="Zevyor Official Logo"
                  fill
                  sizes="(max-width: 640px) 144px, 176px"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links (Right) & User Actions */}
          <div className="flex items-center space-x-5 sm:space-x-7">
            <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium tracking-widest uppercase">
              <Link
                href="/lookbook"
                className="text-brand-black hover:text-brand-burgundy transition-colors duration-200"
              >
                Lookbook
              </Link>
              <Link
                href="/about"
                className="text-brand-black hover:text-brand-burgundy transition-colors duration-200"
              >
                Heritage
              </Link>
            </nav>

            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-brand-black hover:text-brand-burgundy transition p-1.5"
              aria-label="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              className="relative text-brand-black hover:text-brand-burgundy transition p-1.5"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-burgundy text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative text-brand-black hover:text-brand-burgundy transition p-1.5"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-burgundy text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {searchOpen && (
          <div className="py-4 border-t border-brand-cream-dark transition-all duration-300">
            <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Search watches, shawls, materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-brand-cream-light border border-brand-grey-border rounded-none px-4 py-3 pl-11 text-sm focus:outline-none focus:border-brand-burgundy text-brand-black placeholder:text-brand-grey"
              />
              <Search className="w-5 h-5 text-brand-grey absolute left-3.5 top-3.5" />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-brand-burgundy text-white px-4 py-1.5 text-xs uppercase tracking-wider font-semibold hover:bg-brand-burgundy-dark transition"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[110px] z-50 bg-white border-t border-brand-cream-dark shadow-xl overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex flex-col space-y-4 text-base font-semibold tracking-wider uppercase border-b border-brand-cream-dark pb-6">
              <Link
                href="/category/watches"
                onClick={() => setMobileMenuOpen(false)}
                className="text-brand-black hover:text-brand-burgundy py-1"
              >
                Timepieces & Watches
              </Link>
              <Link
                href="/category/shawls"
                onClick={() => setMobileMenuOpen(false)}
                className="text-brand-black hover:text-brand-burgundy py-1"
              >
                Artisanal Shawls
              </Link>
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="text-brand-black hover:text-brand-burgundy py-1"
              >
                Complete Catalogue
              </Link>
              <Link
                href="/lookbook"
                onClick={() => setMobileMenuOpen(false)}
                className="text-brand-black hover:text-brand-burgundy py-1"
              >
                Editorial Lookbook
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-brand-black hover:text-brand-burgundy py-1"
              >
                Brand Story & Heritage
              </Link>
            </div>

            <div className="flex flex-col space-y-3 text-sm text-brand-grey pt-2">
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-brand-black py-1"
              >
                Track Your Order
              </Link>
              <Link
                href="/shipping"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-brand-black py-1"
              >
                Delivery & Shipping Policy
              </Link>
              <Link
                href="/returns"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-brand-black py-1"
              >
                Returns & Exchange (7 Days)
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-brand-black py-1"
              >
                WhatsApp Customer Concierge
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
