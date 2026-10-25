'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { submitCheckoutOrder } from '@/app/actions/checkout';
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  ShoppingBag,
  Tag,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Islamabad Capital Territory',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Gilgit-Baltistan',
  'Azad Jammu & Kashmir',
];

const POPULAR_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Other',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    province: 'Punjab',
    city: 'Lahore',
    customCity: '',
    deliveryAddress: '',
    deliveryInstructions: '',
  });

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [deliveryFee, setDeliveryFee] = useState(299);
  const [deliveryRuleNote, setDeliveryRuleNote] = useState('Standard Delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Recalculate estimated delivery fee based on city
  useEffect(() => {
    const selectedCity =
      formData.city === 'Other' ? formData.customCity.trim().toLowerCase() : formData.city.toLowerCase();

    let fee = 299;
    let note = 'Standard Nationwide Delivery (3-5 days)';

    if (['karachi', 'lahore', 'islamabad', 'rawalpindi'].includes(selectedCity)) {
      fee = 199;
      note = 'Metro Priority Delivery (1-2 days)';
    }

    // Free delivery check on subtotal above Rs 5,000
    const netSubtotal = subtotal - (appliedCoupon?.discount || 0);
    if (netSubtotal >= 5000) {
      fee = 0;
      note = 'Complimentary Free Delivery (Orders above Rs. 5,000)';
    }

    setDeliveryFee(fee);
    setDeliveryRuleNote(note);
  }, [formData.city, formData.customCity, subtotal, appliedCoupon]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'WELCOME10') {
      if (subtotal < 3000) {
        setCouponError('WELCOME10 requires a minimum order value of Rs. 3,000.');
        return;
      }
      const disc = Math.min(Math.round(subtotal * 0.1), 2000);
      setAppliedCoupon({ code, discount: disc });
    } else if (code === 'ZEVYOR500') {
      if (subtotal < 5000) {
        setCouponError('ZEVYOR500 requires a minimum order value of Rs. 5,000.');
        return;
      }
      setAppliedCoupon({ code, discount: 500 });
    } else {
      setCouponError(`Coupon code "${code}" is invalid or expired.`);
    }
  };

  const finalTotal = Math.max(0, subtotal - (appliedCoupon?.discount || 0)) + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (items.length === 0) {
      setSubmitError('Your cart is empty. Please add items before checking out.');
      return;
    }

    const effectiveCity =
      formData.city === 'Other' ? formData.customCity.trim() : formData.city;

    if (!effectiveCity) {
      setSubmitError('Please specify your delivery city.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        province: formData.province,
        city: effectiveCity,
        deliveryAddress: formData.deliveryAddress,
        deliveryInstructions: formData.deliveryInstructions || undefined,
        couponCode: appliedCoupon?.code || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId || null,
          quantity: i.quantity,
        })),
      };

      const result = await submitCheckoutOrder(payload);

      if (result.success && result.orderReference) {
        clearCart();
        router.push(`/order-confirmation/${result.orderReference}`);
      } else {
        setSubmitError(result.error || 'Failed to place order. Please review your details and try again.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand-cream flex items-center justify-center mx-auto text-brand-grey">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif text-brand-black">Your Shopping Bag is Empty</h1>
        <p className="text-xs text-brand-grey max-w-sm mx-auto">
          Add pieces from our collection of precision timepieces and fine shawls to proceed with checkout.
        </p>
        <div className="pt-4">
          <Link
            href="/shop"
            className="inline-block bg-brand-burgundy text-white text-xs uppercase tracking-widest font-semibold px-8 py-3.5 hover:bg-brand-burgundy-dark transition"
          >
            Explore Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Title */}
      <div className="border-b border-brand-cream-dark pb-6 mb-8">
        <h1 className="text-3xl font-serif text-brand-black">Express Cash on Delivery Checkout</h1>
        <p className="text-xs text-brand-grey mt-1">
          Fast guest checkout with no account required. Payment is collected in cash at your doorstep.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Delivery Information Form */}
        <div className="lg:col-span-7 space-y-8">
          {/* Customer Details */}
          <div className="bg-white p-6 sm:p-8 border border-brand-cream-dark space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-3">
              1. Customer & Contact Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-black mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mehmood"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-burgundy"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-black mb-1.5">
                  Mobile Number (for Courier) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0300 1234567"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-burgundy"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-black mb-1.5">
                Email Address (Optional for Order Confirmation)
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="w-full bg-brand-cream-light border border-brand-grey-border px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-burgundy"
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white p-6 sm:p-8 border border-brand-cream-dark space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-3">
              2. Shipping & Delivery Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-black mb-1.5">
                  Province / Region *
                </label>
                <select
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-burgundy"
                >
                  {PAKISTAN_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-black mb-1.5">
                  City *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-burgundy"
                >
                  {POPULAR_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.city === 'Other' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-black mb-1.5">
                  Specify Your City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your town or city name"
                  value={formData.customCity}
                  onChange={(e) => setFormData({ ...formData, customCity: e.target.value })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-burgundy"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-black mb-1.5">
                Complete Street Address (House/Shop #, Street, Area) *
              </label>
              <textarea
                required
                rows={3}
                placeholder="House # 12-A, Street 4, Sector F-7/2..."
                value={formData.deliveryAddress}
                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                className="w-full bg-brand-cream-light border border-brand-grey-border px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-burgundy"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-black mb-1.5">
                Special Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Call before delivery, deliver in afternoon"
                value={formData.deliveryInstructions}
                onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                className="w-full bg-brand-cream-light border border-brand-grey-border px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-burgundy"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-6 sm:p-8 border border-brand-cream-dark space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-3">
              3. Payment Method
            </h2>

            <div className="border-2 border-brand-burgundy bg-brand-cream-light p-4 flex items-start space-x-3">
              <input
                type="radio"
                checked
                readOnly
                className="mt-1 text-brand-burgundy focus:ring-brand-burgundy"
              />
              <div className="space-y-1">
                <span className="text-sm font-bold text-brand-black">
                  Cash on Delivery (COD)
                </span>
                <p className="text-xs text-brand-grey leading-relaxed">
                  Pay securely in cash directly to the courier rider upon package inspection at your delivery address. No advance payment or credit card required.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Placement */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 border border-brand-cream-dark space-y-6 sticky top-28 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-3">
              Order Summary ({items.length} items)
            </h2>

            {/* Item Previews */}
            <div className="space-y-4 max-h-72 overflow-y-auto divide-y divide-brand-cream-dark">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || 'default'}`}
                  className="pt-3 first:pt-0 flex space-x-3 text-xs"
                >
                  <div className="relative w-14 h-16 bg-brand-cream flex-shrink-0 border border-brand-cream-dark overflow-hidden">
                    <Image
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=100'}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-brand-black line-clamp-1">
                        {item.productName}
                      </h4>
                      {item.variantTitle && (
                        <p className="text-[11px] text-brand-grey">{item.variantTitle}</p>
                      )}
                      <p className="text-[11px] text-brand-grey mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-brand-black">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Entry */}
            <div className="pt-4 border-t border-brand-cream-dark">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Discount code (e.g. WELCOME10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-brand-cream-light border border-brand-grey-border px-3 py-2 text-xs uppercase tracking-wider focus:outline-none focus:border-brand-burgundy"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-brand-black text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-brand-burgundy transition"
                >
                  Apply
                </button>
              </div>

              {appliedCoupon && (
                <div className="mt-2 text-xs text-emerald-800 bg-emerald-50 p-2 border border-emerald-200 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponInput('');
                    }}
                    className="text-red-600 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{couponError}</span>
                </p>
              )}
            </div>

            {/* Totals Breakdown */}
            <div className="pt-4 border-t border-brand-cream-dark space-y-2 text-xs text-brand-black">
              <div className="flex justify-between">
                <span className="text-brand-grey">Subtotal:</span>
                <span className="font-semibold">Rs. {subtotal.toLocaleString()}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-brand-burgundy font-semibold">
                  <span>Discount ({appliedCoupon.code}):</span>
                  <span>- Rs. {appliedCoupon.discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <div>
                  <span className="text-brand-grey">Delivery Fee:</span>
                  <p className="text-[10px] text-brand-grey">{deliveryRuleNote}</p>
                </div>
                <span className="font-semibold">
                  {deliveryFee === 0 ? 'FREE' : `Rs. ${deliveryFee.toLocaleString()}`}
                </span>
              </div>

              <div className="pt-3 border-t border-brand-cream-dark flex justify-between items-baseline text-base font-serif font-bold text-brand-black">
                <span>Total Due on Delivery:</span>
                <span className="text-xl text-brand-burgundy">
                  Rs. {finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Confirm Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-burgundy hover:bg-brand-burgundy-dark disabled:bg-gray-400 text-white py-4 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 shadow-lg transition"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Confirm Cash on Delivery Order</span>
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-brand-grey space-y-1">
              <p>✔ Safe & Secure 256-bit Encrypted Checkout</p>
              <p>✔ Open inspection permitted with courier</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
