'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Save, AlertTriangle, CheckCircle } from 'lucide-react';

interface AdminInventoryClientProps {
  variants: any[];
  canEdit: boolean;
}

export default function AdminInventoryClient({ variants, canEdit }: AdminInventoryClientProps) {
  const router = useRouter();
  const [stockMap, setStockMap] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    variants.forEach((v) => {
      init[v.id] = v.stockQuantity;
    });
    return init;
  });

  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');

  const filtered = variants.filter((v) => {
    const matchesSearch =
      v.product.name.toLowerCase().includes(search.toLowerCase()) ||
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      (v.sku && v.sku.toLowerCase().includes(search.toLowerCase()));

    const currentQty = stockMap[v.id] ?? v.stockQuantity;
    if (filterMode === 'OUT') return matchesSearch && currentQty <= 0;
    if (filterMode === 'LOW') return matchesSearch && currentQty > 0 && currentQty <= 5;
    return matchesSearch;
  });

  const handleSaveStock = async (variantId: string) => {
    setSavingId(variantId);
    try {
      const res = await fetch('/api/admin/inventory/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId,
          stockQuantity: stockMap[variantId],
        }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update stock');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          {(['ALL', 'LOW', 'OUT'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition ${
                filterMode === mode
                  ? 'bg-brand-burgundy text-white'
                  : 'bg-white border border-brand-grey-border text-brand-black hover:bg-brand-cream'
              }`}
            >
              {mode === 'ALL'
                ? `All Items (${variants.length})`
                : mode === 'LOW'
                ? 'Low Stock (≤5)'
                : 'Sold Out (0)'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search variant, product, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-brand-grey-border px-3.5 py-1.5 pl-8 text-xs focus:outline-none focus:border-brand-burgundy"
          />
          <Search className="w-3.5 h-3.5 text-brand-grey absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-brand-cream-dark overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-brand-cream uppercase text-brand-black font-semibold border-b border-brand-cream-dark">
            <tr>
              <th className="p-3">Product & Variant</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Category</th>
              <th className="p-3">Selling Price</th>
              <th className="p-3">Tracked</th>
              <th className="p-3">Units in Stock</th>
              {canEdit && <th className="p-3 text-right">Quick Save</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-cream-dark">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-brand-grey">
                  No inventory items match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((v) => {
                const img =
                  v.imageUrl ||
                  v.product.images[0]?.url ||
                  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=100';

                const currentStock = stockMap[v.id] ?? v.stockQuantity;
                const isDirty = currentStock !== v.stockQuantity;

                return (
                  <tr key={v.id} className="hover:bg-brand-cream-light/60 transition">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-9 h-11 bg-brand-cream flex-shrink-0 border border-brand-cream-dark overflow-hidden">
                          <Image src={img} alt={v.title} fill className="object-cover" />
                        </div>
                        <div>
                          <span className="font-semibold text-brand-black block">
                            {v.product.name}
                          </span>
                          <span className="text-[11px] text-brand-grey font-medium">
                            {v.title}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-brand-black">{v.sku || v.product.sku || '—'}</td>
                    <td className="p-3 text-brand-grey">
                      {v.product.category?.name || 'Unassigned'}
                    </td>
                    <td className="p-3 font-semibold text-brand-black">
                      Rs. {(v.price || v.product.sellingPrice).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          v.product.trackInventory ? 'text-emerald-700' : 'text-brand-grey'
                        }`}
                      >
                        {v.product.trackInventory ? 'Enforced' : 'Untracked'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min={0}
                          disabled={!canEdit}
                          value={currentStock}
                          onChange={(e) =>
                            setStockMap({
                              ...stockMap,
                              [v.id]: Math.max(0, parseInt(e.target.value, 10) || 0),
                            })
                          }
                          className={`w-20 border px-2 py-1 text-xs font-bold text-center focus:outline-none ${
                            currentStock === 0
                              ? 'border-red-300 bg-red-50 text-red-700'
                              : currentStock <= 5
                              ? 'border-amber-300 bg-amber-50 text-amber-800'
                              : 'border-brand-grey-border bg-white text-brand-black'
                          }`}
                        />
                        {currentStock === 0 ? (
                          <span className="text-[10px] text-red-600 font-bold uppercase">
                            Out of Stock
                          </span>
                        ) : currentStock <= 5 ? (
                          <span className="text-[10px] text-amber-700 font-bold uppercase">
                            Low
                          </span>
                        ) : null}
                      </div>
                    </td>
                    {canEdit && (
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleSaveStock(v.id)}
                          disabled={!isDirty || savingId === v.id}
                          className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition flex items-center space-x-1 ml-auto ${
                            isDirty
                              ? 'bg-brand-burgundy hover:bg-brand-burgundy-dark text-white shadow'
                              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                          }`}
                        >
                          <Save className="w-3 h-3" />
                          <span>{savingId === v.id ? 'Saving...' : 'Save'}</span>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
