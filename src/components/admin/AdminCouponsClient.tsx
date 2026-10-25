'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { upsertCoupon, deleteCoupon } from '@/app/actions/admin-settings';
import { Tag, Plus, Edit2, Trash2, X } from 'lucide-react';

export default function AdminCouponsClient({
  coupons,
  canEdit,
}: {
  coupons: any[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    id: undefined as string | undefined,
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountAmount: 10,
    minOrderValue: 3000,
    maxDiscount: undefined as number | undefined,
    usageLimit: undefined as number | undefined,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setEditingCoupon(null);
    setFormData({
      id: undefined,
      code: '',
      discountType: 'PERCENTAGE',
      discountAmount: 10,
      minOrderValue: 3000,
      maxDiscount: undefined,
      usageLimit: undefined,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (c: any) => {
    setEditingCoupon(c);
    setFormData({
      id: c.id,
      code: c.code,
      discountType: c.discountType,
      discountAmount: c.discountAmount,
      minOrderValue: c.minOrderValue,
      maxDiscount: c.maxDiscount || undefined,
      usageLimit: c.usageLimit || undefined,
      isActive: c.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await upsertCoupon(formData);
    setLoading(false);
    if (res.success) {
      setModalOpen(false);
      router.refresh();
    } else {
      alert(res.error || 'Failed to save coupon');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    const res = await deleteCoupon(id);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-brand-grey">
          Configure promotional discount codes with minimum order values, limits, and expiration controls.
        </p>
        {canEdit && (
          <button
            onClick={openCreate}
            className="bg-brand-burgundy hover:bg-brand-burgundy-dark text-white px-4 py-2.5 text-xs uppercase tracking-wider font-semibold flex items-center space-x-1.5 shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        )}
      </div>

      <div className="bg-white border border-brand-cream-dark overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-brand-cream uppercase text-brand-black font-semibold border-b border-brand-cream-dark">
            <tr>
              <th className="p-3">Coupon Code</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Min Order</th>
              <th className="p-3">Cap (Max)</th>
              <th className="p-3">Usages</th>
              <th className="p-3">Status</th>
              {canEdit && <th className="p-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-cream-dark">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-brand-cream-light/60 transition">
                <td className="p-3 font-mono font-bold text-brand-black flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-burgundy" />
                  <span>{c.code}</span>
                </td>
                <td className="p-3 font-semibold text-brand-black">
                  {c.discountType === 'PERCENTAGE'
                    ? `${c.discountAmount}% OFF`
                    : `Rs. ${c.discountAmount.toLocaleString()} OFF`}
                </td>
                <td className="p-3 text-brand-grey">
                  Rs. {c.minOrderValue.toLocaleString()}
                </td>
                <td className="p-3 text-brand-grey">
                  {c.maxDiscount ? `Rs. ${c.maxDiscount.toLocaleString()}` : 'No Cap'}
                </td>
                <td className="p-3 font-mono">
                  {c.usageCount} {c.usageLimit ? `/ ${c.usageLimit}` : 'uses'}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                {canEdit && (
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 text-brand-black hover:text-brand-burgundy transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.code)}
                        className="p-1.5 text-brand-grey hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full border border-brand-cream-dark p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-brand-cream-dark pb-3">
              <h3 className="text-base font-serif text-brand-black">
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Coupon'}
              </h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-brand-grey" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-brand-black mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border p-2 font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-brand-black mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as any,
                      })
                    }
                    className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (PKR)</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase font-bold text-brand-black mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.discountAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, discountAmount: Number(e.target.value) })
                    }
                    className="w-full bg-brand-cream-light border border-brand-grey-border p-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-brand-black mb-1">
                    Min Order Value (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minOrderValue}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderValue: Number(e.target.value) })
                    }
                    className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-brand-black mb-1">
                    Max Cap (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="None"
                    value={formData.maxDiscount || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxDiscount: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
                  />
                </div>
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center space-x-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="text-brand-burgundy focus:ring-brand-burgundy"
                  />
                  <span>Active & Redeemable</span>
                </label>
              </div>

              <div className="pt-4 border-t border-brand-cream-dark flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border uppercase font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand-burgundy text-white px-5 py-2 uppercase font-semibold text-xs"
                >
                  {loading ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
