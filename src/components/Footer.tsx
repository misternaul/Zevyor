import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Truck, RotateCcw, ShieldCheck, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-black text-brand-cream border-t border-brand-black-light">
      {/* Brand Value Pillars */}
      <div className="border-b border-brand-black-light py-10 bg-brand-black-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start space-y-2">
            <Truck className="w-6 h-6 text-brand-burgundy-light" />
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase">Nationwide COD</h4>
            <p className="text-brand-grey text-xs">Reliable Cash on Delivery service to every city across Pakistan.</p>
          </div>
          <div className="flex flex-col items-center sm:items-start space-y-2">
            <ShieldCheck className="w-6 h-6 text-brand-burgundy-light" />
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase">Authentic Craftsmanship</h4>
            <p className="text-brand-grey text-xs">Handcrafted pashminas and precision chronographs engineered to last.</p>
          </div>
          <div className="flex flex-col items-center sm:items-start space-y-2">
            <RotateCcw className="w-6 h-6 text-brand-burgundy-light" />
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase">7-Day Inspection</h4>
            <p className="text-brand-grey text-xs">Easy exchanges on all unworn items in original packaging.</p>
          </div>
          <div className="flex flex-col items-center sm:items-start space-y-2">
            <MessageCircle className="w-6 h-6 text-brand-burgundy-light" />
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase">WhatsApp Concierge</h4>
            <p className="text-brand-grey text-xs">Direct styling advice and expedited ordering via WhatsApp.</p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Logo & Brand Bio */}
          <div className="md:col-span-2 space-y-5">
            <div className="relative h-14 w-44">
              <Image
                src="/assets/zevyor-official-logo.png"
                alt="Zevyor Official Logo"
                fill
                className="object-contain filter invert opacity-90"
              />
            </div>
            <p className="text-brand-grey text-sm leading-relaxed max-w-sm">
              Zevyor is a modern ecommerce lifestyle brand born from the pursuit of bold individuality, quality, and timeless masculine aesthetics.
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 bg-brand-black-light text-brand-cream-dark text-xs uppercase tracking-widest border border-brand-black-light">
                Pakistan Initial Launch
              </span>
            </div>
          </div>

          {/* Product Categories */}
          <div className="space-y-4">
            <h4 className="text-white text-xs font-semibold tracking-widest uppercase">Collections</h4>
            <ul className="space-y-2 text-sm text-brand-grey">
              <li>
                <Link href="/category/watches" className="hover:text-white transition">
                  Luxury Timepieces
                </Link>
              </li>
              <li>
                <Link href="/category/shawls" className="hover:text-white transition">
                  Cashmere & Wool Shawls
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition">
                  View All Products
                </Link>
              </li>
              <li>
                <Link href="/lookbook" className="hover:text-white transition">
                  Campaign Lookbook
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div className="space-y-4">
            <h4 className="text-white text-xs font-semibold tracking-widest uppercase">Customer Care</h4>
            <ul className="space-y-2 text-sm text-brand-grey">
              <li>
                <Link href="/track-order" className="hover:text-white transition">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition">
                  Returns & Exchange Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  WhatsApp Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & About */}
          <div className="space-y-4">
            <h4 className="text-white text-xs font-semibold tracking-widest uppercase">Legal & Heritage</h4>
            <ul className="space-y-2 text-sm text-brand-grey">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Zevyor
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-white transition text-xs opacity-60">
                  Staff Access
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-brand-black-light flex flex-col sm:flex-row items-center justify-between text-xs text-brand-grey space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} Zevyor. All rights reserved.</p>
          <p className="flex items-center space-x-2">
            <span>Official Currency:</span>
            <strong className="text-white">PKR (Pakistani Rupee)</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
