'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Search, Package, MapPin, Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface OrderLookupResult {
  orderReference: string;
  status: string;
  paymentStatus: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  customerName: string;
  city: string;
  finalTotal: number;
  createdAt: string;
}

export default function TrackOrderPage() {
  const [orderReference, setOrderReference] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setLoading(true);

    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderReference: orderReference.trim().toUpperCase(),
          phoneNumber: phoneNumber.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrder(data.order);
      } else {
        setError(data.error || 'No matching order found. Please verify your reference and phone number.');
      }
    } catch (err: any) {
      setError('Failed to query order tracking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-brand-burgundy">
          Order Tracking
        </span>
        <h1 className="text-3xl font-serif text-brand-black">Track Your Parcel</h1>
        <p className="text-xs text-brand-grey max-w-md mx-auto">
          Enter your order reference code and registered phone number to verify current dispatch and delivery status.
        </p>
      </div>

      <form onSubmit={handleLookup} className="bg-white p-6 sm:p-8 border border-brand-cream-dark space-y-4 shadow-sm">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-brand-black mb-1">
            Order Reference Code *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. ZVR-202610-A1B2C"
            value={orderReference}
            onChange={(e) => setOrderReference(e.target.value)}
            className="w-full bg-brand-cream-light border border-brand-grey-border px-3.5 py-2.5 text-sm uppercase focus:outline-none focus:border-brand-burgundy font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-brand-black mb-1">
            Registered Mobile Number *
          </label>
          <input
            type="tel"
            required
            placeholder="e.g. 0300 1234567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full bg-brand-cream-light border border-brand-grey-border px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-burgundy"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-burgundy hover:bg-brand-burgundy-dark disabled:bg-gray-400 text-white py-3.5 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 transition"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Verifying...' : 'Check Status'}</span>
        </button>
      </form>

      {/* Lookup Result Display */}
      {order && (
        <div className="bg-white p-6 sm:p-8 border border-brand-cream-dark space-y-6 shadow-sm">
          <div className="flex justify-between items-start border-b border-brand-cream-dark pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-grey">
                Order Status
              </span>
              <h2 className="text-xl font-serif text-brand-black mt-0.5">{order.orderReference}</h2>
              <p className="text-xs text-brand-grey mt-0.5">
                Recipient: {order.customerName} ({order.city})
              </p>
            </div>
            <span
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded ${
                order.status === 'DELIVERED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.status === 'DISPATCHED'
                  ? 'bg-blue-100 text-blue-800'
                  : order.status === 'CANCELLED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-brand-grey">Payment (Cash on Delivery):</p>
              <p className="font-semibold text-brand-black capitalize">
                {order.paymentStatus.replace('_', ' ').toLowerCase()}
              </p>
            </div>
            <div>
              <p className="text-brand-grey">Total Amount:</p>
              <p className="font-semibold text-brand-black">
                Rs. {order.finalTotal.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-brand-grey">Courier Partner:</p>
              <p className="font-semibold text-brand-black">
                {order.courierName || 'Pending Assignment'}
              </p>
            </div>
            <div>
              <p className="text-brand-grey">Tracking Number:</p>
              {order.trackingNumber ? (
                order.trackingUrl ? (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand-burgundy underline"
                  >
                    {order.trackingNumber}
                  </a>
                ) : (
                  <p className="font-semibold text-brand-black">{order.trackingNumber}</p>
                )
              ) : (
                <p className="font-semibold text-brand-grey">Awaiting Dispatch</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
