'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { upsertLookbookEntry, deleteLookbookEntry } from '@/app/actions/admin-settings';
import { Camera, Plus, Trash2, Edit2, X } from 'lucide-react';

export default function AdminLookbookClient({
  entries,
  canEdit,
}: {
  entries: any[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    id: undefined as string | undefined,
    title: '',
    caption: '',
    imageUrl: '',
    displayOrder: 1,
    isPublished: true,
  });

  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setEditingEntry(null);
    setFormData({
      id: undefined,
      title: '',
      caption: '',
      imageUrl: '',
      displayOrder: entries.length + 1,
      isPublished: true,
    });
    setModalOpen(true);
  };

  const openEdit = (e: any) => {
    setEditingEntry(e);
    setFormData({
      id: e.id,
      title: e.title,
      caption: e.caption || '',
      imageUrl: e.imageUrl,
      displayOrder: e.displayOrder,
      isPublished: e.isPublished,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await upsertLookbookEntry(formData);
    setLoading(false);
    if (res.success) {
      setModalOpen(false);
      router.refresh();
    } else {
      alert(res.error || 'Failed to save lookbook entry');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete lookbook entry "${title}"?`)) return;
    const res = await deleteLookbookEntry(id);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Failed to delete lookbook entry');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-brand-grey">
          Curate editorial campaign imagery showcased on the public lookbook page.
        </p>
        {canEdit && (
          <button
            onClick={openCreate}
            className="bg-brand-burgundy hover:bg-brand-burgundy-dark text-white px-4 py-2.5 text-xs uppercase tracking-wider font-semibold flex items-center space-x-1.5 shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Campaign Entry</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((item) => (
          <div key={item.id} className="bg-white border border-brand-cream-dark overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="relative aspect-[16/10] bg-brand-cream overflow-hidden">
              <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
              <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                Order: {item.displayOrder}
              </span>
            </div>

            <div className="p-4 space-y-2">
              <h3 className="font-serif font-bold text-sm text-brand-black">{item.title}</h3>
              {item.caption && (
                <p className="text-xs text-brand-grey line-clamp-2">{item.caption}</p>
              )}
            </div>

            {canEdit && (
              <div className="p-4 pt-0 border-t border-brand-cream-dark flex items-center justify-between text-xs">
                <span
                  className={`text-[10px] font-bold uppercase ${
                    item.isPublished ? 'text-emerald-700' : 'text-neutral-500'
                  }`}
                >
                  {item.isPublished ? 'Published' : 'Hidden'}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1 text-brand-black hover:text-brand-burgundy"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1 text-brand-grey hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full border border-brand-cream-dark p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-brand-cream-dark pb-3">
              <h3 className="text-base font-serif text-brand-black">
                {editingEntry ? `Edit: ${editingEntry.title}` : 'New Lookbook Entry'}
              </h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-brand-grey" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-brand-black mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-brand-black mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-brand-black mb-1">
                  Caption / Narrative
                </label>
                <textarea
                  rows={2}
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-brand-black mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: Number(e.target.value) })
                    }
                    className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) =>
                        setFormData({ ...formData, isPublished: e.target.checked })
                      }
                      className="text-brand-burgundy focus:ring-brand-burgundy"
                    />
                    <span>Publish Entry</span>
                  </label>
                </div>
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
                  {loading ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
