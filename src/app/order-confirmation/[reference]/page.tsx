import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { CheckCircle2, Package, MapPin, Truck, MessageCircle, ArrowRight } from 'lucide-react';

interface OrderConfirmationPageProps {
  params: { reference: string };
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const order = await db.order.findUnique({
    where: { orderReference: params.reference },
    include: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Get WhatsApp number from settings
  let whatsappNumber = '923000000000';
  try {
    const s = await db.storeSetting.findUnique({ where: { key: 'whatsappNumber' } });
    if (s?.value) whatsappNumber = s.value;
  } catch {}

  const whatsappInquiryText = encodeURIComponent(
    `*Assalam-o-Alaikum Zevyor!* I just placed order #${order.orderReference}. Please verify my delivery details.`
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Success Banner */}
      <div className="bg-white border border-brand-cream-dark p-8 sm:p-12 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-brand-burgundy">
          Order Successfully Confirmed
        </span>

        <h1 className="text-3xl sm:text-4xl font-serif text-brand-black">
          Thank You, {order.customerName.split(' ')[0]}
        </h1>

        <p className="text-sm text-brand-grey max-w-lg mx-auto">
          Your Cash on Delivery order has been registered in our database. We are preparing your parcel for dispatch.
        </p>

        {/* Order Reference Box */}
        <div className="inline-block bg-brand-cream-light border border-brand-cream-dark px-6 py-3 my-4">
          <p className="text-xs text-brand-grey uppercase tracking-widest">Order Reference</p>
          <p className="text-xl font-bold font-mono text-brand-black mt-0.5">
            {order.orderReference}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappInquiryText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-xs uppercase tracking-widest font-semibold transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Notify Concierge on WhatsApp</span>
          </a>

          <Link
            href="/shop"
            className="inline-flex items-center space-x-2 bg-brand-black hover:bg-brand-black-light text-white px-6 py-3 text-xs uppercase tracking-widest font-semibold transition"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Order Details & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        {/* Ordered Items */}
        <div className="bg-white p-6 sm:p-8 border border-brand-cream-dark space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-3 flex items-center space-x-2">
            <Package className="w-4 h-4 text-brand-burgundy" />
            <span>Ordered Items</span>
          </h2>

          <div className="space-y-4 divide-y divide-brand-cream-dark text-xs">
            {order.items.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-brand-black">{item.productName}</h4>
                  {item.variantTitle && (
                    <p className="text-brand-grey text-[11px]">{item.variantTitle}</p>
                  )}
                  <p className="text-brand-grey mt-0.5">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-brand-black">
                  Rs. {item.totalPrice.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-4 border-t border-brand-cream-dark space-y-2 text-xs">
            <div className="flex justify-between text-brand-grey">
              <span>Subtotal:</span>
              <span className="font-semibold text-brand-black">
                Rs. {order.subtotal.toLocaleString()}
              </span>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex justify-between text-brand-burgundy font-semibold">
                <span>Discounts Applied:</span>
                <span>- Rs. {order.discountTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-brand-grey">
              <span>Delivery Fee:</span>
              <span className="font-semibold text-brand-black">
                {order.deliveryFee === 0 ? 'FREE' : `Rs. ${order.deliveryFee.toLocaleString()}`}
              </span>
            </div>
            <div className="pt-3 border-t border-brand-cream-dark flex justify-between text-base font-serif font-bold text-brand-black">
              <span>Total Due on Delivery:</span>
              <span className="text-brand-burgundy">Rs. {order.finalTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Delivery & Payment Information */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 border border-brand-cream-dark space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-3 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-brand-burgundy" />
              <span>Delivery Information</span>
            </h2>

            <div className="text-xs space-y-2 text-brand-black">
              <p>
                <strong>Recipient:</strong> {order.customerName}
              </p>
              <p>
                <strong>Contact Phone:</strong> {order.customerPhone}
              </p>
              {order.customerEmail && (
                <p>
                  <strong>Email:</strong> {order.customerEmail}
                </p>
              )}
              <p>
                <strong>Address:</strong> {order.deliveryAddress}
              </p>
              <p>
                <strong>City & Region:</strong> {order.city}, {order.province}
              </p>
              {order.deliveryInstructions && (
                <p className="italic text-brand-grey">
                  <strong>Notes:</strong> {order.deliveryInstructions}
                </p>
              )}
            </div>
          </div>

          <div className="bg-brand-cream-light p-6 border border-brand-cream-dark space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-black flex items-center space-x-2">
              <Truck className="w-4 h-4 text-brand-burgundy" />
              <span>Next Steps for Cash on Delivery</span>
            </h3>
            <p className="text-xs text-brand-grey leading-relaxed">
              1. Our dispatch team will review your order details within 24 hours.
              <br />
              2. You will receive an SMS or WhatsApp notification when the parcel is handed to the courier.
              <br />
              3. Please prepare the exact cash amount of <strong>Rs. {order.finalTotal.toLocaleString()}</strong> for the courier rider upon delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
