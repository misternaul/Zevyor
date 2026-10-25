'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { deleteProduct } from '@/app/actions/admin-products';
import ProductFormModal from './ProductFormModal';
import { Plus, Edit2, Trash2, Search, AlertCircle } from 'lucide-react';

interface AdminProductsClientProps {
  products: any[];
  categories: { id: string; name: string }[];
  isOwner: boolean;
  canEdit: boolean;
}

export default function AdminProductsClient({
  products,
  categories,
  isOwner,
  canEdit,
}: AdminProductsClientProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesCat =
      categoryFilter === 'ALL' || (p.category && p.category.id === categoryFilter);
    return matchesSearch && matchesCat;
  });

  const handleDelete = async (productId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete or archive product "${name}"?`)) {
      return;
    }

    setDeletingId(productId);
    const res = await deleteProduct(productId);
    setDeletingId(null);

    if (res.success) {
      if (res.message) {
        alert(res.message);
      }
      router.refresh();
    } else {
      alert(res.error || 'Failed to delete product.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-brand-grey-border px-3.5 py-2 pl-9 text-xs focus:outline-none focus:border-brand-burgundy w-64"
            />
            <Search className="w-4 h-4 text-brand-grey absolute left-2.5 top-2.5" />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-brand-grey-border px-3 py-2 text-xs focus:outline-none focus:border-brand-burgundy"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {canEdit && (
          <button
            onClick={() => {
              setSelectedProduct(null);
              setModalOpen(true);
            }}
            className="bg-brand-burgundy hover:bg-brand-burgundy-dark text-white px-4 py-2.5 text-xs uppercase tracking-wider font-semibold flex items-center space-x-1.5 shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-brand-cream-dark overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-brand-cream uppercase text-brand-black font-semibold border-b border-brand-cream-dark">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Selling Price</th>
                {isOwner && <th className="p-3">Cost Price</th>}
                <th className="p-3">Stock / Variants</th>
                <th className="p-3">Status</th>
                {canEdit && <th className="p-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-cream-dark">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-brand-grey">
                    No products found.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const primaryImg =
                    prod.images.find((i: any) => i.isPrimary)?.url ||
                    prod.images[0]?.url ||
                    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=100';

                  const totalStock = prod.variants.reduce(
                    (sum: number, v: any) => sum + v.stockQuantity,
                    0
                  );

                  return (
                    <tr key={prod.id} className="hover:bg-brand-cream-light/60 transition">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-10 h-12 bg-brand-cream flex-shrink-0 border border-brand-cream-dark overflow-hidden">
                            <Image src={primaryImg} alt={prod.name} fill className="object-cover" />
                          </div>
                          <div>
                            <span className="font-semibold text-brand-black block">
                              {prod.name}
                            </span>
                            <span className="text-[10px] text-brand-grey">
                              {prod.variants.length} variant(s)
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-brand-grey">
                        {prod.category ? prod.category.name : 'Unassigned'}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-brand-black">
                        {prod.sku || '—'}
                      </td>
                      <td className="p-3 font-bold text-brand-black">
                        Rs. {prod.sellingPrice.toLocaleString()}
                      </td>
                      {isOwner && (
                        <td className="p-3 text-brand-grey font-mono">
                          {prod.costPrice ? `Rs. ${prod.costPrice.toLocaleString()}` : '—'}
                        </td>
                      )}
                      <td className="p-3">
                        <span
                          className={`font-semibold ${
                            totalStock <= 5 ? 'text-red-600' : 'text-brand-black'
                          }`}
                        >
                          {totalStock} units
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                            prod.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {prod.status}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedProduct(prod);
                                setModalOpen(true);
                              }}
                              className="p-1.5 text-brand-black hover:text-brand-burgundy transition"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(prod.id, prod.name)}
                              disabled={deletingId === prod.id}
                              className="p-1.5 text-brand-grey hover:text-red-600 transition disabled:opacity-40"
                              title="Delete or Archive Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* Modal */}
      {modalOpen && (
        <ProductFormModal
          initialData={selectedProduct}
          categories={categories}
          isOwner={isOwner}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
