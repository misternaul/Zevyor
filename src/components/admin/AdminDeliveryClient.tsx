'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { upsertDeliveryRule, deleteDeliveryRule } from '@/app/actions/admin-settings';
import { Truck, Plus, Edit2, Trash2, X } from 'lucide-react';

export default function AdminDeliveryClient({
  rules,
  canEdit,
}: {
  rules: any[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    id: undefined as string | undefined,
    name: '',
    city: '',
    province: '',
    fee: 299,
    minOrderForFreeDelivery: 5000 as number | undefined,
    priority: 1,
    estimatedDays: '3 - 5 business days',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setEditingRule(null);
    setFormData({
      id: undefined,
      name: '',
      city: '',
      province: '',
      fee: 299,
      minOrderForFreeDelivery: 5000,
      priority: 1,
      estimatedDays: '2 - 4 business days',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (r: any) => {
    setEditingRule(r);
    setFormData({
      id: r.id,
      name: r.name,
      city: r.city || '',
      province: r.province || '',
      fee: r.fee,
      minOrderForFreeDelivery: r.minOrderForFreeDelivery || undefined,
      priority: r.priority,
      estimatedDays: r.estimatedDays || '',
      isActive: r.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await upsertDeliveryRule({
      ...formData,
      city: formData.city.trim() || null,
      province: formData.province.trim() || null,
      minOrderForFreeDelivery: formData.minOrderForFreeDelivery
        ? Number(formData.minOrderForFreeDelivery)
        : null,
      fee: Number(formData.fee),
      priority: Number(formData.priority),
    });
    setLoading(false);
    if (res.success) {
      setModalOpen(false);
      router.refresh();
    } else {
      alert(res.error || 'Failed to save delivery rule');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete delivery rule "${name}"?`)) return;
    const res = await deleteDeliveryRule(id);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Failed to delete rule');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-brand-grey max-w-xl">
          Rules are evaluated by priority: City match takes highest precedence, then Province match, falling back to Nationwide default.
        </p>
        {canEdit && (
          <button
            onClick={openCreate}
            className="bg-brand-burgundy hover:bg-brand-burgundy-dark text-white px-4 py-2.5 text-xs uppercase tracking-wider font-semibold flex items-center space-x-1.5 shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Delivery Rule</span>
          </button>
        )}
      </div>

      <div className="bg-white border border-brand-cream-dark overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-brand-cream uppercase text-brand-black font-semibold border-b border-brand-cream-dark">
            <tr>
              <th className="p-3">Priority</th>
              <th className="p-3">Rule Name</th>
              <th className="p-3">Target Zone</th>
              <th className="p-3">Standard Fee</th>
              <th className="p-3">Free Delivery Threshold</th>
              <th className="p-3">Transit Time</th>
              <th className="p-3">Status</th>
              {canEdit && <th className="p-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-cream-dark">
            {rules.map((r) => (
              <tr key={r.id} className="hover:bg-brand-cream-light/60 transition">
                <td className="p-3 font-mono font-bold text-brand-burgundy">{r.priority}</td>
                <td className="p-3 font-semibold text-brand-black flex items-center space-x-1.5">
                  <Truck className="w-3.5 h-3.5 text-brand-grey" />
                  <span>{r.name}</span>
                </td>
                <td className="p-3 text-brand-black">
                  {r.city ? `City: ${r.city}` : r.province ? `Province: ${r.province}` : 'All Pakistan (Default)'}
                </td>
                <td className="p-3 font-bold">
                  {r.fee === 0 ? 'FREE' : `Rs. ${r.fee.toLocaleString()}`}
                </td>
                <td className="p-3 text-brand-grey">
                  {r.minOrderForFreeDelivery
                    ? `≥ Rs. ${r.minOrderForFreeDelivery.toLocaleString()}`
                    : 'None'}
                </td>
                <td className="p-3 text-brand-grey">{r.estimatedDays || '—'}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      r.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {r.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                {canEdit && (
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="p-1.5 text-brand-black hover:text-brand-burgundy transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id, r.name)}
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
                {editingRule ? `Edit Rule: ${editingRule.name}` : 'New Delivery Tariff'}
              </h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-brand-grey" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-brand-black mb-1">
                  Rule Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karachi Metro Priority"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-brand-black mb-1">
                    City (Exact Match)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave empty for all"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-brand-black mb-1">
                    Province (Regional Match)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave empty for all"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-brand-black mb-1">
                    Delivery Fee (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                    className="w-full bg-brand-cream-light border border-brand-grey-border p-2 font-bold"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-brand-black mb-1">
                    Free Delivery At (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="5000"
                    value={formData.minOrderForFreeDelivery || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderForFreeDelivery: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-brand-black mb-1">
                    Priority Score (1-10)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-full bg-brand-cream-light border border-brand-grey-border p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-brand-black mb-1">
                    Transit Timeline Text
                  </label>
                  <input
                    type="text"
                    placeholder="1 - 2 business days"
                    value={formData.estimatedDays}
                    onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
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
                  <span>Rule is Active</span>
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
                  {loading ? 'Saving...' : 'Save Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
