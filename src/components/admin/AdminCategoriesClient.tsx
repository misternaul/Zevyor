'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { upsertCategory, deleteCategory } from '@/app/actions/admin-categories';
import { Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';

interface AdminCategoriesClientProps {
  categories: any[];
  canEdit: boolean;
}

export default function AdminCategoriesClient({
  categories,
  canEdit,
}: AdminCategoriesClientProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    id: undefined as string | undefined,
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    displayOrder: 0,
    isPublished: true,
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState<any | null>(null);
  const [reassignId, setReassignId] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setEditingCategory(null);
    setFormData({
      id: undefined,
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      displayOrder: categories.length + 1,
      isPublished: true,
    });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (cat: any) => {
    setEditingCategory(cat);
    setFormData({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      imageUrl: cat.imageUrl || '',
      displayOrder: cat.displayOrder,
      isPublished: cat.isPublished,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await upsertCategory(formData);
      if (res.success) {
        setModalOpen(false);
        router.refresh();
      } else {
        setError(res.error || 'Failed to save category.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!targetCategory) return;
    setLoading(true);

    try {
      const res = await deleteCategory({
        categoryId: targetCategory.id,
        reassignCategoryId: reassignId || null,
      });

      if (res.success) {
        setDeleteModalOpen(false);
        setTargetCategory(null);
        router.refresh();
      } else {
        alert(res.error || 'Failed to delete category.');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-brand-grey">
          Categories dynamically populate storefront navigation, breadcrumbs, and filters.
        </p>
        {canEdit && (
          <button
            onClick={openCreate}
            className="bg-brand-burgundy hover:bg-brand-burgundy-dark text-white px-4 py-2.5 text-xs uppercase tracking-wider font-semibold flex items-center space-x-1.5 shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Category</span>
          </button>
        )}
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-brand-cream-dark overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-brand-cream uppercase text-brand-black font-semibold border-b border-brand-cream-dark">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Category Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Assigned Products</th>
              <th className="p-3">Visibility</th>
              {canEdit && <th className="p-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-cream-dark">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-brand-cream-light/60 transition">
                <td className="p-3 font-mono font-bold text-brand-grey">{cat.displayOrder}</td>
                <td className="p-3 font-semibold text-brand-black">{cat.name}</td>
                <td className="p-3 font-mono text-brand-grey">/category/{cat.slug}</td>
                <td className="p-3 font-semibold text-brand-black">
                  {cat._count.products} products
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      cat.isPublished
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {cat.isPublished ? 'Published' : 'Hidden'}
                  </span>
                </td>
                {canEdit && (
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 text-brand-black hover:text-brand-burgundy transition"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setTargetCategory(cat);
                          setReassignId('');
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-brand-grey hover:text-red-600 transition"
                        title="Delete Category"
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

      {/* Edit / Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border border-brand-cream-dark shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-brand-cream-dark pb-3">
              <h2 className="text-lg font-serif text-brand-black">
                {editingCategory ? `Edit: ${editingCategory.name}` : 'New Category'}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-brand-grey" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {error && <div className="p-2.5 bg-red-50 text-red-700 text-xs">{error}</div>}

              <div>
                <label className="block text-xs font-semibold uppercase text-brand-black mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)+/g, '');
                    setFormData({ ...formData, name, slug: formData.id ? formData.slug : slug });
                  }}
                  className="w-full bg-brand-cream-light border border-brand-grey-border px-3 py-2 text-sm focus:outline-none focus:border-brand-burgundy"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-brand-black mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-burgundy"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-brand-black mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border px-3 py-2 text-sm focus:outline-none focus:border-brand-burgundy"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-brand-black mb-1">
                  Banner Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border px-3 py-2 text-sm focus:outline-none focus:border-brand-burgundy"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-brand-black mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: Number(e.target.value) })
                    }
                    className="w-full bg-brand-cream-light border border-brand-grey-border px-3 py-2 text-sm focus:outline-none focus:border-brand-burgundy"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-brand-black cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) =>
                        setFormData({ ...formData, isPublished: e.target.checked })
                      }
                      className="text-brand-burgundy focus:ring-brand-burgundy"
                    />
                    <span>Publish Category</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-cream-dark flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold uppercase border border-brand-grey-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand-burgundy hover:bg-brand-burgundy-dark text-white px-5 py-2 text-xs uppercase font-semibold transition"
                >
                  {loading ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe Category Deletion Dialog */}
      {deleteModalOpen && targetCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full border border-red-200 shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-base font-bold text-brand-black">
                Delete Category: &ldquo;{targetCategory.name}&rdquo;
              </h3>
            </div>

            <p className="text-xs text-brand-grey leading-relaxed">
              This category currently contains{' '}
              <strong className="text-brand-black">{targetCategory._count.products}</strong>{' '}
              product(s). Deleting will not delete your products.
            </p>

            {targetCategory._count.products > 0 && (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold uppercase text-brand-black">
                  Select Safe Reassignment Option:
                </label>
                <select
                  value={reassignId}
                  onChange={(e) => setReassignId(e.target.value)}
                  className="w-full bg-brand-cream-light border border-brand-grey-border p-2 text-xs focus:outline-none focus:border-brand-burgundy"
                >
                  <option value="">
                    Leave products unassigned & set to Draft (Safe Fallback)
                  </option>
                  {categories
                    .filter((c) => c.id !== targetCategory.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        Reassign all to &ldquo;{c.name}&rdquo;
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="pt-4 border-t border-brand-cream-dark flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold uppercase border border-brand-grey-border"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 text-xs uppercase font-semibold transition"
              >
                {loading ? 'Processing...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
