'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { adminLogout } from '@/app/actions/admin-auth';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingBag,
  Tag,
  Gift,
  Truck,
  Sliders,
  Camera,
  Star,
  KeyRound,
  History,
  LogOut,
  ExternalLink,
  Shield,
  UserCheck,
} from 'lucide-react';

interface AdminSidebarProps {
  admin: {
    id: string;
    label: string;
    isOwner: boolean;
    permissions: { module: string; canView: boolean; canEdit: boolean }[];
  };
}

export default function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const canView = (module: string) => {
    if (admin.isOwner) return true;
    const p = admin.permissions.find((perm) => perm.module === module);
    return !!(p?.canView || p?.canEdit);
  };

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, module: 'DASHBOARD' },
    { label: 'Products', href: '/admin/products', icon: Package, module: 'PRODUCTS' },
    { label: 'Categories', href: '/admin/categories', icon: Layers, module: 'CATEGORIES' },
    { label: 'Inventory', href: '/admin/inventory', icon: Boxes, module: 'INVENTORY' },
    { label: 'Orders (COD)', href: '/admin/orders', icon: ShoppingBag, module: 'ORDERS' },
    { label: 'Coupons', href: '/admin/coupons', icon: Tag, module: 'COUPONS' },
    { label: 'Bundles', href: '/admin/bundles', icon: Gift, module: 'BUNDLES' },
    { label: 'Delivery Rules', href: '/admin/delivery', icon: Truck, module: 'DELIVERY' },
    { label: 'Store Settings', href: '/admin/settings', icon: Sliders, module: 'SETTINGS' },
    { label: 'Lookbook', href: '/admin/lookbook', icon: Camera, module: 'LOOKBOOK' },
    { label: 'Reviews', href: '/admin/reviews', icon: Star, module: 'REVIEWS' },
    { label: 'Passcodes & RBAC', href: '/admin/passcodes', icon: KeyRound, module: 'PASSCODES', ownerOnly: true },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: History, module: 'AUDIT_LOGS' },
  ];

  const handleLogout = async () => {
    await adminLogout();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside className="w-64 bg-brand-black text-brand-cream border-r border-neutral-800 flex flex-col justify-between h-screen sticky top-0 flex-shrink-0 z-30">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="p-6 border-b border-neutral-800 flex flex-col space-y-3">
          <div className="relative h-10 w-32">
            <Image
              src="/assets/zevyor-official-logo.png"
              alt="Zevyor"
              fill
              className="object-contain filter invert opacity-90"
            />
          </div>
          <div className="flex items-center space-x-2 pt-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center space-x-1 ${
                admin.isOwner
                  ? 'bg-brand-burgundy text-white'
                  : 'bg-neutral-800 text-brand-cream-dark'
              }`}
            >
              {admin.isOwner ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
              <span>{admin.isOwner ? 'Primary Owner' : 'Staff Passcode'}</span>
            </span>
            <span className="text-xs text-brand-grey truncate max-w-[110px]" title={admin.label}>
              {admin.label}
            </span>
          </div>
        </div>

        {/* Navigation Items (Permission Filtered) */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            if (item.ownerOnly && !admin.isOwner) return null;
            if (!canView(item.module)) return null;

            const isActive =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded text-xs font-semibold tracking-wider uppercase transition ${
                  isActive
                    ? 'bg-brand-burgundy text-white shadow'
                    : 'text-brand-cream-dark/70 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-brand-grey'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-brand-grey hover:text-white hover:bg-neutral-800 rounded transition"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/30 rounded transition font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
