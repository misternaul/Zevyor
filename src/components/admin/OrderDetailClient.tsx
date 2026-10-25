'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  updateOrderStatus,
  updateOrderPaymentStatus,
  updateOrderCourier,
  addOrderNote,
} from '@/app/actions/admin-orders';
import {
  Package,
  MapPin,
  Truck,
  DollarSign,
  FileText,
  Clock,
  History,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface OrderDetailClientProps {
  order: any;
  canEdit: boolean;
}

export default function OrderDetailClient({ order, canEdit }: OrderDetailClientProps) {
  const router = useRouter();

  // Status transition state
  const [status, setStatus] = useState(order.status);
  const [statusNote, setStatusNote] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  // Payment status state
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Courier state
  const [courierName, setCourierName] = useState(order.courierName || '');
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl || '');
  const [courierLoading, setCourierLoading] = useState(false);

  // Note state
  const [newNote, setNewNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  const handleUpdateStatus = async () => {
    setStatusLoading(true);
    const res = await updateOrderStatus({
      orderId: order.id,
      newStatus: status,
      note: statusNote,
    });
    setStatusLoading(false);
    if (res.success) {
      setStatusNote('');
      router.refresh();
    } else {
      alert(res.error || 'Failed to update order status.');
    }
  };

  const handleUpdatePayment = async (newVal: string) => {
    setPaymentStatus(newVal);
    setPaymentLoading(true);
    const res = await updateOrderPaymentStatus({
      orderId: order.id,
      paymentStatus: newVal,
    });
    setPaymentLoading(false);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Failed to update payment status.');
    }
  };

  const handleUpdateCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourierLoading(true);
    const res = await updateOrderCourier({
      orderId: order.id,
      courierName,
      trackingNumber,
      trackingUrl,
    });
    setCourierLoading(false);
    if (res.success) {
      alert('Courier tracking information successfully updated.');
      router.refresh();
    } else {
      alert(res.error || 'Failed to update courier details.');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNoteLoading(true);
    const res = await addOrderNote({
      orderId: order.id,
      note: newNote,
    });
    setNoteLoading(false);
    if (res.success) {
      setNewNote('');
      router.refresh();
    } else {
      alert(res.error || 'Failed to append note.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Details & Items */}
      <div className="lg:col-span-8 space-y-6">
        {/* Ordered Items */}
        <div className="bg-white p-6 border border-brand-cream-dark space-y-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-3 flex items-center space-x-2">
            <Package className="w-4 h-4 text-brand-burgundy" />
            <span>Ordered Items ({order.items.length})</span>
          </h2>

          <div className="space-y-4 divide-y divide-brand-cream-dark text-xs">
            {order.items.map((item: any) => (
              <div key={item.id} className="pt-3 first:pt-0 flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-brand-black">{item.productName}</h4>
                  {item.variantTitle && (
                    <p className="text-brand-grey text-[11px]">Variant: {item.variantTitle}</p>
                  )}
                  {item.sku && (
                    <p className="text-brand-grey text-[11px] font-mono">SKU: {item.sku}</p>
                  )}
                  <p className="text-brand-grey mt-1">
                    Qty: {item.quantity} × Rs. {item.unitPrice.toLocaleString()}
                  </p>
                </div>
                <span className="font-bold text-brand-black">
                  Rs. {item.totalPrice.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-brand-cream-dark space-y-2 text-xs">
            <div className="flex justify-between text-brand-grey">
              <span>Subtotal:</span>
              <span className="font-semibold text-brand-black">
                Rs. {order.subtotal.toLocaleString()}
              </span>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex justify-between text-brand-burgundy font-semibold">
                <span>Total Discount Applied:</span>
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
              <span>Final Total (COD Due):</span>
              <span className="text-brand-burgundy">Rs. {order.finalTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Customer & Address Details */}
        <div className="bg-white p-6 border border-brand-cream-dark space-y-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-3 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-brand-burgundy" />
            <span>Customer & Delivery Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-brand-grey">Customer Full Name:</p>
              <p className="font-semibold text-brand-black text-sm">{order.customerName}</p>
            </div>
            <div>
              <p className="text-brand-grey">Mobile Contact:</p>
              <p className="font-semibold text-brand-black font-mono text-sm">{order.customerPhone}</p>
            </div>
            <div>
              <p className="text-brand-grey">Email Address:</p>
              <p className="font-medium text-brand-black">{order.customerEmail || 'None provided'}</p>
            </div>
            <div>
              <p className="text-brand-grey">Province & City:</p>
              <p className="font-semibold text-brand-black">
                {order.city}, {order.province}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-brand-grey">Street / House Address:</p>
              <p className="font-medium text-brand-black bg-brand-cream-light p-3 border border-brand-cream-dark mt-1">
                {order.deliveryAddress}
              </p>
            </div>
            {order.deliveryInstructions && (
              <div className="sm:col-span-2">
                <p className="text-brand-grey">Customer Special Instructions:</p>
                <p className="italic text-brand-black bg-amber-50 p-2 border border-amber-200 mt-1">
                  {order.deliveryInstructions}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Internal Staff Notes */}
        <div className="bg-white p-6 border border-brand-cream-dark space-y-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-3 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-brand-burgundy" />
            <span>Internal Administrative Notes</span>
          </h2>

          {order.internalNotes ? (
            <pre className="text-xs bg-brand-cream-light p-4 border border-brand-cream-dark font-sans whitespace-pre-wrap text-brand-black leading-relaxed">
              {order.internalNotes}
            </pre>
          ) : (
            <p className="text-xs text-brand-grey">No internal notes added yet.</p>
          )}

          {canEdit && (
            <form onSubmit={handleAddNote} className="flex space-x-2 pt-2">
              <input
                type="text"
                placeholder="Add internal note (e.g. customer confirmed on call)..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 bg-brand-cream-light border border-brand-grey-border px-3 py-2 text-xs focus:outline-none focus:border-brand-burgundy"
              />
              <button
                type="submit"
                disabled={noteLoading}
                className="bg-brand-black hover:bg-brand-black-light text-white px-4 py-2 text-xs uppercase font-semibold transition"
              >
                {noteLoading ? 'Saving...' : 'Add Note'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Right Column: Fulfillment, Courier, Payment & History */}
      <div className="lg:col-span-4 space-y-6">
        {/* Status Transition Control */}
        <div className="bg-white p-6 border border-brand-cream-dark space-y-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-3">
            Fulfillment Status
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-brand-black mb-1">
                Current State:
              </label>
              <select
                disabled={!canEdit}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-brand-cream-light border border-brand-grey-border p-2.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-brand-burgundy"
              >
                <option value="PENDING">PENDING (New)</option>
                <option value="CONFIRMED">CONFIRMED (Verified with client)</option>
                <option value="PROCESSING">PROCESSING (Packaging)</option>
                <option value="DISPATCHED">DISPATCHED (Handed to courier)</option>
                <option value="DELIVERED">DELIVERED (Completed)</option>
                <option value="CANCELLED">CANCELLED (Restores stock)</option>
              </select>
            </div>

            {canEdit && (
              <>
                <div>
                  <label className="block text-xs text-brand-grey mb-1">
                    Transition Note (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Called customer, confirmed Karachi address"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full bg-brand-cream-light border border-brand-grey-border p-2 text-xs"
                  />
                </div>

                <button
                  onClick={handleUpdateStatus}
                  disabled={statusLoading || status === order.status}
                  className="w-full bg-brand-burgundy hover:bg-brand-burgundy-dark disabled:bg-gray-300 text-white py-2.5 text-xs uppercase font-semibold tracking-wider transition"
                >
                  {statusLoading ? 'Updating Status...' : 'Apply Status Change'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* COD Payment Status */}
        <div className="bg-white p-6 border border-brand-cream-dark space-y-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-3 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Cash on Delivery Collection</span>
          </h2>

          <div>
            <label className="block text-xs text-brand-grey mb-1.5">Collection Status:</label>
            <div className="flex flex-col space-y-2 text-xs">
              {['AWAITING_COLLECTION', 'COLLECTED', 'REFUNDED'].map((pVal) => (
                <label
                  key={pVal}
                  className={`p-2.5 border flex items-center space-x-2.5 cursor-pointer rounded transition ${
                    paymentStatus === pVal
                      ? 'border-brand-burgundy bg-brand-cream-light font-bold text-brand-black'
                      : 'border-brand-cream-dark hover:bg-gray-50 text-brand-grey'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentStatus"
                    value={pVal}
                    disabled={!canEdit || paymentLoading}
                    checked={paymentStatus === pVal}
                    onChange={() => handleUpdatePayment(pVal)}
                    className="text-brand-burgundy focus:ring-brand-burgundy"
                  />
                  <span>
                    {pVal === 'AWAITING_COLLECTION'
                      ? 'Awaiting Collection (Unpaid COD)'
                      : pVal === 'COLLECTED'
                      ? 'Cash Collected by Courier (Realized Sale)'
                      : 'Refunded / Returned'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Courier Partner & Tracking */}
        <div className="bg-white p-6 border border-brand-cream-dark space-y-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-3 flex items-center space-x-2">
            <Truck className="w-4 h-4 text-brand-burgundy" />
            <span>Courier Dispatch Information</span>
          </h2>

          <form onSubmit={handleUpdateCourier} className="space-y-3 text-xs">
            <div>
              <label className="block text-brand-grey mb-1">Courier Partner Name:</label>
              <input
                type="text"
                disabled={!canEdit}
                placeholder="e.g. TCS, Leopard, M&P, Trax"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="w-full bg-brand-cream-light border border-brand-grey-border p-2 focus:outline-none focus:border-brand-burgundy"
              />
            </div>

            <div>
              <label className="block text-brand-grey mb-1">Tracking Number / CN #:</label>
              <input
                type="text"
                disabled={!canEdit}
                placeholder="e.g. 7748920192"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full bg-brand-cream-light border border-brand-grey-border p-2 font-mono focus:outline-none focus:border-brand-burgundy"
              />
            </div>

            <div>
              <label className="block text-brand-grey mb-1">Tracking URL (Optional):</label>
              <input
                type="url"
                disabled={!canEdit}
                placeholder="https://track.courier.com/..."
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                className="w-full bg-brand-cream-light border border-brand-grey-border p-2 focus:outline-none focus:border-brand-burgundy"
              />
            </div>

            {canEdit && (
              <button
                type="submit"
                disabled={courierLoading}
                className="w-full bg-brand-black hover:bg-brand-black-light text-white py-2 text-xs uppercase font-semibold transition"
              >
                {courierLoading ? 'Saving Tracking...' : 'Save Courier Details'}
              </button>
            )}
          </form>
        </div>

        {/* Audit Status History Timeline */}
        {order.statusHistory.length > 0 && (
          <div className="bg-white p-6 border border-brand-cream-dark space-y-4 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-3 flex items-center space-x-2">
              <History className="w-4 h-4 text-brand-burgundy" />
              <span>Status History Trail</span>
            </h2>

            <div className="space-y-3 text-xs">
              {order.statusHistory.map((hist: any) => (
                <div key={hist.id} className="border-l-2 border-brand-burgundy pl-3 py-1 space-y-0.5">
                  <div className="flex justify-between font-semibold text-brand-black">
                    <span>
                      {hist.fromStatus} → {hist.toStatus}
                    </span>
                    <span className="text-[10px] text-brand-grey">
                      {new Date(hist.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  {hist.note && <p className="text-brand-grey text-[11px]">{hist.note}</p>}
                  {hist.changedBy && (
                    <p className="text-[10px] text-brand-burgundy font-medium">
                      By: {hist.changedBy.label}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
