import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getCurrentAdmin, checkPermission } from '@/lib/auth';
import OrderDetailClient from '@/components/admin/OrderDetailClient';
import { ArrowLeft } from 'lucide-react';

interface OrderPageProps {
  params: { id: string };
}

export const revalidate = 0;

export default async function AdminOrderDetailPage({ params }: OrderPageProps) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  if (!checkPermission(admin, 'ORDERS', 'VIEW')) {
    redirect('/admin');
  }

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      statusHistory: {
        include: { changedBy: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const canEdit = checkPermission(admin, 'ORDERS', 'EDIT');

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 text-xs text-brand-grey border-b border-brand-cream-dark pb-4">
        <Link
          href="/admin/orders"
          className="hover:text-brand-black flex items-center space-x-1 font-semibold uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Orders</span>
        </Link>
        <span>/</span>
        <span className="font-mono font-bold text-brand-black">{order.orderReference}</span>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif text-brand-black">
            Order Reference: {order.orderReference}
          </h1>
          <p className="text-xs text-brand-grey mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleString()} • Cash on Delivery
          </p>
        </div>
      </div>

      <OrderDetailClient order={order} canEdit={canEdit} />
    </div>
  );
}
