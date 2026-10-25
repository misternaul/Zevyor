import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getCurrentAdmin, checkPermission } from '@/lib/auth';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  AlertTriangle,
  ArrowRight,
  Package,
  TrendingUp,
  History,
  ShieldCheck,
  Boxes,
} from 'lucide-react';

export const revalidate = 0; // Fresh dashboard metrics

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  if (!checkPermission(admin, 'DASHBOARD', 'VIEW')) {
    return (
      <div className="bg-white p-8 border border-brand-cream-dark text-center space-y-3">
        <h2 className="text-lg font-serif text-brand-black">Access Restricted</h2>
        <p className="text-xs text-brand-grey">
          Your administrative passcode does not have permission to view Dashboard metrics.
        </p>
      </div>
    );
  }

  // 1. Fetch Real Order Analytics
  const [orders, allVariants, auditLogs] = await Promise.all([
    db.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    }),
    db.productVariant.findMany({
      include: { product: true },
    }),
    db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ]);

  const totalOrdersCount = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED');
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED');
  const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED');

  // Realized collected revenue vs pipeline order value
  const realizedRevenue = orders
    .filter((o) => o.paymentStatus === 'COLLECTED')
    .reduce((sum, o) => sum + o.finalTotal, 0);

  const awaitingCollectionValue = orders
    .filter((o) => o.paymentStatus === 'AWAITING_COLLECTION' && o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.finalTotal, 0);

  // Low stock products (stock <= 5 and tracking enabled)
  const lowStockItems = allVariants.filter(
    (v) => v.product.trackInventory && v.stockQuantity <= 5
  );

  return (
    <div className="space-y-8">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-cream-dark pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-brand-black">Operations Dashboard</h1>
          <p className="text-xs text-brand-grey mt-0.5">
            Real-time sales, order fulfillment, and inventory health metrics.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/orders"
            className="bg-brand-burgundy text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-brand-burgundy-dark transition"
          >
            Manage Orders
          </Link>
          <Link
            href="/admin/products"
            className="bg-brand-black text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-brand-black-light transition"
          >
            Add Product
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Realized Revenue */}
        <div className="bg-white p-6 border border-brand-cream-dark space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-brand-grey">
            <span>Collected Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-emerald-700">
            Rs. {realizedRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-brand-grey">
            Actual cash received & collected from COD deliveries.
          </p>
        </div>

        {/* Pipeline Value (Awaiting Collection) */}
        <div className="bg-white p-6 border border-brand-cream-dark space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-brand-grey">
            <span>COD In Pipeline</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-brand-black">
            Rs. {awaitingCollectionValue.toLocaleString()}
          </p>
          <p className="text-[11px] text-brand-grey">
            Dispatched or pending COD orders awaiting rider collection.
          </p>
        </div>

        {/* Pending Orders Count */}
        <div className="bg-white p-6 border border-brand-cream-dark space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-brand-grey">
            <span>Orders Awaiting Action</span>
            <ShoppingBag className="w-4 h-4 text-brand-burgundy" />
          </div>
          <p className="text-2xl font-bold font-serif text-brand-burgundy">
            {pendingOrders.length}
          </p>
          <p className="text-[11px] text-brand-grey">
            Requires verification, packing, or courier dispatch.
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 border border-brand-cream-dark space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-brand-grey">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-red-600">
            {lowStockItems.length}
          </p>
          <p className="text-[11px] text-brand-grey">
            Items with 5 or fewer units remaining in inventory.
          </p>
        </div>
      </div>

      {/* Middle Section: Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white p-6 border border-brand-cream-dark space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-brand-cream-dark pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-black flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-brand-burgundy" />
              <span>Recent Cash on Delivery Orders</span>
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs text-brand-burgundy font-semibold hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-xs text-brand-grey">
              No orders have been received yet. Test by placing an order from the storefront.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-brand-cream-light uppercase text-brand-grey font-semibold">
                  <tr>
                    <th className="p-2.5">Reference</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">City</th>
                    <th className="p-2.5">Total</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Payment</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-cream-dark">
                  {orders.slice(0, 6).map((ord) => (
                    <tr key={ord.id} className="hover:bg-brand-cream-light/60 transition">
                      <td className="p-2.5 font-mono font-bold text-brand-black">
                        {ord.orderReference}
                      </td>
                      <td className="p-2.5 font-medium">{ord.customerName}</td>
                      <td className="p-2.5 text-brand-grey">{ord.city}</td>
                      <td className="p-2.5 font-bold">Rs. {ord.finalTotal.toLocaleString()}</td>
                      <td className="p-2.5">
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
                      <td className="p-2.5">
                        <span
                          className={`text-[11px] font-semibold ${
                            ord.paymentStatus === 'COLLECTED'
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {ord.paymentStatus === 'COLLECTED' ? 'Collected' : 'Pending COD'}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="text-brand-burgundy font-semibold hover:underline"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Warning Box */}
        <div className="lg:col-span-4 bg-white p-6 border border-brand-cream-dark space-y-4 shadow-sm">
          <div className="border-b border-brand-cream-dark pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-black flex items-center space-x-2">
              <Boxes className="w-4 h-4 text-red-600" />
              <span>Low Inventory Watchlist</span>
            </h2>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="text-center py-8 text-xs text-emerald-700 bg-emerald-50 p-4 border border-emerald-200">
              ✔ All inventory levels are healthy.
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-brand-cream-light border border-brand-cream-dark flex justify-between items-center text-xs"
                >
                  <div>
                    <h4 className="font-semibold text-brand-black">{item.product.name}</h4>
                    <p className="text-[11px] text-brand-grey">{item.title}</p>
                  </div>
                  <span className="font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded text-[11px]">
                    {item.stockQuantity} left
                  </span>
                </div>
              ))}
              <div className="pt-2 text-center">
                <Link
                  href="/admin/inventory"
                  className="text-xs font-semibold text-brand-burgundy hover:underline"
                >
                  Manage All Inventory
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Administrative Audit Trail */}
      {checkPermission(admin, 'AUDIT_LOGS', 'VIEW') && auditLogs.length > 0 && (
        <div className="bg-white p-6 border border-brand-cream-dark space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-brand-cream-dark pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-black flex items-center space-x-2">
              <History className="w-4 h-4 text-brand-burgundy" />
              <span>Recent Administrative Actions</span>
            </h2>
            <Link
              href="/admin/audit-logs"
              className="text-xs text-brand-burgundy font-semibold hover:underline"
            >
              View Full Audit Log
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-brand-cream-light border border-brand-cream-dark text-xs space-y-1">
                <div className="flex justify-between font-semibold text-brand-black">
                  <span>{log.action}</span>
                  <span className="text-[10px] text-brand-grey">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-brand-grey text-[11px] line-clamp-2">{log.changeSummary}</p>
                <p className="text-[10px] text-brand-burgundy font-medium pt-1">
                  By: {log.passcodeLabel || 'System'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
