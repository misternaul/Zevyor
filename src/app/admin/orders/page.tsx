import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getCurrentAdmin, checkPermission } from '@/lib/auth';
import { ShoppingBag, Search, Filter, ArrowRight } from 'lucide-react';

interface OrdersPageProps {
  searchParams: {
    q?: string;
    status?: string;
  };
}

export const revalidate = 0;

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  if (!checkPermission(admin, 'ORDERS', 'VIEW')) {
    return (
      <div className="bg-white p-8 border border-brand-cream-dark text-center space-y-3">
        <h2 className="text-lg font-serif text-brand-black">Access Denied</h2>
        <p className="text-xs text-brand-grey">
          Your administrative passcode lacks permission to access Orders.
        </p>
      </div>
    );
  }

  const { q, status } = searchParams;

  const where: any = {};
  if (q && q.trim()) {
    where.OR = [
      { orderReference: { contains: q.trim().toUpperCase() } },
      { customerName: { contains: q.trim() } },
      { customerPhone: { contains: q.trim() } },
      { city: { contains: q.trim() } },
    ];
  }

  if (status && status !== 'ALL') {
    where.status = status;
  }

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
    },
  });

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      <div className="border-b border-brand-cream-dark pb-4">
        <h1 className="text-2xl font-serif text-brand-black">Cash on Delivery Orders</h1>
        <p className="text-xs text-brand-grey mt-0.5">
          Fulfill customer orders, assign courier partners, record parcel tracking numbers, and update collection states.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {statuses.map((s) => (
            <Link
              key={s}
              href={`/admin/orders?${new URLSearchParams({
                ...(q ? { q } : {}),
                status: s,
              }).toString()}`}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition ${
                (status === s || (!status && s === 'ALL'))
                  ? 'bg-brand-burgundy text-white'
                  : 'bg-white border border-brand-grey-border text-brand-black hover:bg-brand-cream'
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        <form method="GET" className="relative w-full sm:w-64">
          <input
            type="text"
            name="q"
            defaultValue={q || ''}
            placeholder="Search reference, phone, name..."
            className="w-full bg-white border border-brand-grey-border px-3.5 py-1.5 pl-8 text-xs focus:outline-none focus:border-brand-burgundy"
          />
          <Search className="w-3.5 h-3.5 text-brand-grey absolute left-2.5 top-2.5" />
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-brand-cream-dark overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-brand-cream uppercase text-brand-black font-semibold border-b border-brand-cream-dark">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Date</th>
                <th className="p-3">Customer Details</th>
                <th className="p-3">Destination</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Fulfillment Status</th>
                <th className="p-3">COD Payment</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-cream-dark">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-brand-grey">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-brand-cream-light/60 transition">
                    <td className="p-3 font-mono font-bold text-brand-black">
                      {ord.orderReference}
                    </td>
                    <td className="p-3 text-brand-grey">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-brand-black block">
                        {ord.customerName}
                      </span>
                      <span className="text-[11px] text-brand-grey font-mono">
                        {ord.customerPhone}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-brand-black">{ord.city}</span>
                      <span className="text-[10px] text-brand-grey block">{ord.province}</span>
                    </td>
                    <td className="p-3 font-bold text-brand-black">
                      Rs. {ord.finalTotal.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          ord.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'DISPATCHED'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[11px] font-semibold ${
                          ord.paymentStatus === 'COLLECTED'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {ord.paymentStatus === 'COLLECTED' ? '✔ Collected' : 'Pending COD'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="inline-flex items-center space-x-1 text-brand-burgundy font-semibold hover:underline"
                      >
                        <span>View Order</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
