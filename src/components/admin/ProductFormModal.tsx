'use client';

import React, { useState } from 'react';
import { upsertProduct } from '@/app/actions/admin-products';
import { X, Plus, Trash2, Image as ImageIcon, Check } from 'lucide-react';

interface ProductFormModalProps {
  initialData?: any;
  categories: { id: string; name: string }[];
  isOwner: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductFormModal({
  initialData,
  categories,
  isOwner,
  onClose,
  onSuccess,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    id: initialData?.id || undefined,
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    shortDescription: initialData?.shortDescription || '',
    fullDescription: initialData?.fullDescription || '',
    categoryId: initialData?.categoryId || categories[0]?.id || '',
    sku: initialData?.sku || '',
    tags: initialData?.tags || '',
    sellingPrice: initialData?.sellingPrice || 9999,
    originalPrice: initialData?.originalPrice || '',
    costPrice: initialData?.costPrice || '',
    trackInventory: initialData?.trackInventory ?? true,
    status: initialData?.status || 'PUBLISHED',
    isFeatured: initialData?.isFeatured ?? false,
    isNewArrival: initialData?.isNewArrival ?? false,
    isBestseller: initialData?.isBestseller ?? false,
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
  });

  const [images, setImages] = useState<
    { url: string; altText: string; isPrimary: boolean; displayOrder: number }[]
  >(
    initialData?.images?.map((img: any, idx: number) => ({
      url: img.url,
      altText: img.altText || '',
      isPrimary: img.isPrimary ?? idx === 0,
      displayOrder: img.displayOrder ?? idx,
    })) || [
      {
        url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000',
        altText: 'Primary product image',
        isPrimary: true,
        displayOrder: 0,
      },
    ]
  );

  const [variants, setVariants] = useState<
    {
      id?: string;
      title: string;
      sku?: string;
      price?: number | string;
      stockQuantity: number;
      color?: string;
      size?: string;
      material?: string;
    }[]
  >(
    initialData?.variants?.map((v: any) => ({
      id: v.id,
      title: v.title,
      sku: v.sku || '',
      price: v.price || '',
      stockQuantity: v.stockQuantity,
      color: v.color || '',
      size: v.size || '',
      material: v.material || '',
    })) || [
      {
        title: 'Standard',
        stockQuantity: 15,
      },
    ]
  );

  const [newImageUrl, setNewImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([
      ...images,
      {
        url: newImageUrl.trim(),
        altText: formData.name,
        isPrimary: images.length === 0,
        displayOrder: images.length,
      },
    ]);
    setNewImageUrl('');
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        title: `Option ${variants.length + 1}`,
        stockQuantity: 10,
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        ...formData,
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        costPrice: formData.costPrice ? Number(formData.costPrice) : null,
        sellingPrice: Number(formData.sellingPrice),
        images,
        variants: variants.map((v) => ({
          ...v,
          price: v.price ? Number(v.price) : null,
          stockQuantity: Number(v.stockQuantity),
        })),
      };

      const res = await upsertProduct(payload);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Failed to save product.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-brand-cream-dark shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-brand-cream-dark flex items-center justify-between bg-brand-cream-light sticky top-0 z-10">
          <h2 className="text-lg font-serif text-brand-black">
            {initialData ? `Edit Product: ${initialData.name}` : 'Create New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-brand-grey hover:text-brand-black transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {/* Core Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-2">
              General Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-brand-black mb-1">
                  Product Name *
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-brand-black mb-1">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border px-3 py-2 text-sm focus:outline-none focus:border-brand-burgundy"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-brand-black mb-1">
                  SKU Code
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="ZVR-W-001"
                  className="w-full bg-brand-cream-light border border-brand-grey-border px-3 py-2 text-sm focus:outline-none focus:border-brand-burgundy"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-brand-black mb-1">
                  Publication Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border px-3 py-2 text-sm focus:outline-none focus:border-brand-burgundy"
                >
                  <option value="PUBLISHED">Published (Visible in store)</option>
                  <option value="DRAFT">Draft (Hidden)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-brand-black mb-1">
                Short Description
              </label>
              <textarea
                rows={2}
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full bg-brand-cream-light border border-brand-grey-border px-3 py-2 text-sm focus:outline-none focus:border-brand-burgundy"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-brand-black mb-1">
                Full Description & Specifications
              </label>
              <textarea
                rows={4}
                value={formData.fullDescription}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                className="w-full bg-brand-cream-light border border-brand-grey-border px-3 py-2 text-sm focus:outline-none focus:border-brand-burgundy"
              />
            </div>
          </div>

          {/* Pricing & Cost */}
          <div className="space-y-4 pt-4 border-t border-brand-cream-dark">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-2">
              Pricing & Economics (PKR)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-brand-black mb-1">
                  Selling Price (PKR) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border px-3 py-2 text-sm focus:outline-none focus:border-brand-burgundy"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-brand-black mb-1">
                  Original Price (Strikethrough Sale)
                </label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="Optional"
                  className="w-full bg-brand-cream-light border border-brand-grey-border px-3 py-2 text-sm focus:outline-none focus:border-brand-burgundy"
                />
              </div>

              {isOwner ? (
                <div>
                  <label className="block text-xs font-semibold uppercase text-brand-black mb-1">
                    Cost Price (Owner Only)
                  </label>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="Confidential cost"
                    className="w-full bg-brand-cream-light border border-brand-grey-border px-3 py-2 text-sm focus:outline-none focus:border-brand-burgundy"
                  />
                </div>
              ) : null}
            </div>

            {/* Badges Toggles */}
            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center space-x-2 text-xs font-semibold text-brand-black cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="text-brand-burgundy focus:ring-brand-burgundy"
                />
                <span>Featured on Homepage</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-semibold text-brand-black cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNewArrival}
                  onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                  className="text-brand-burgundy focus:ring-brand-burgundy"
                />
                <span>New Arrival Badge</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-semibold text-brand-black cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBestseller}
                  onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                  className="text-brand-burgundy focus:ring-brand-burgundy"
                />
                <span>Bestseller Badge</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-semibold text-brand-black cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.trackInventory}
                  onChange={(e) => setFormData({ ...formData, trackInventory: e.target.checked })}
                  className="text-brand-burgundy focus:ring-brand-burgundy"
                />
                <span>Enforce Stock Tracking</span>
              </label>
            </div>
          </div>

          {/* Image Management */}
          <div className="space-y-4 pt-4 border-t border-brand-cream-dark">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-2">
              Image Gallery
            </h3>

            <div className="flex space-x-2">
              <input
                type="url"
                placeholder="Paste Image URL (https://...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 bg-brand-cream-light border border-brand-grey-border px-3 py-2 text-xs focus:outline-none focus:border-brand-burgundy"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="bg-brand-black text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-brand-burgundy transition"
              >
                Add Image
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`p-2 border relative bg-brand-cream-light space-y-1.5 ${
                    img.isPrimary ? 'border-brand-burgundy ring-1 ring-brand-burgundy' : 'border-brand-grey-border'
                  }`}
                >
                  <img src={img.url} alt={img.altText} className="w-full h-24 object-cover" />
                  <div className="flex items-center justify-between text-[10px]">
                    <button
                      type="button"
                      onClick={() =>
                        setImages(
                          images.map((item, i) => ({
                            ...item,
                            isPrimary: i === idx,
                          }))
                        )
                      }
                      className={`font-semibold ${img.isPrimary ? 'text-brand-burgundy' : 'text-brand-grey hover:text-brand-black'}`}
                    >
                      {img.isPrimary ? '✔ Primary' : 'Set Primary'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Variants Management */}
          <div className="space-y-4 pt-4 border-t border-brand-cream-dark">
            <div className="flex justify-between items-center border-b border-brand-cream-dark pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-black">
                Variants & Inventory Stock
              </h3>
              <button
                type="button"
                onClick={handleAddVariant}
                className="text-xs font-semibold text-brand-burgundy hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-brand-cream-light border border-brand-grey-border grid grid-cols-1 sm:grid-cols-4 gap-3 items-center text-xs"
                >
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-brand-grey mb-1">
                      Variant Title
                    </label>
                    <input
                      type="text"
                      required
                      value={v.title}
                      onChange={(e) => {
                        const copy = [...variants];
                        copy[idx].title = e.target.value;
                        setVariants(copy);
                      }}
                      className="w-full bg-white border border-brand-grey-border px-2 py-1 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-brand-grey mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={v.stockQuantity}
                      onChange={(e) => {
                        const copy = [...variants];
                        copy[idx].stockQuantity = Number(e.target.value);
                        setVariants(copy);
                      }}
                      className="w-full bg-white border border-brand-grey-border px-2 py-1 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-brand-grey mb-1">
                      Price Override (Optional)
                    </label>
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => {
                        const copy = [...variants];
                        copy[idx].price = e.target.value;
                        setVariants(copy);
                      }}
                      placeholder="Same as product"
                      className="w-full bg-white border border-brand-grey-border px-2 py-1 text-xs"
                    />
                  </div>

                  <div className="flex justify-end pt-3 sm:pt-0">
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                        className="text-red-600 hover:text-red-800 p-1"
                        aria-label="Remove variant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-brand-cream-dark flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs uppercase font-semibold tracking-wider text-brand-black border border-brand-grey-border hover:bg-brand-cream transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-burgundy hover:bg-brand-burgundy-dark disabled:bg-gray-400 text-white px-6 py-2.5 text-xs uppercase font-semibold tracking-wider transition"
            >
              {loading ? 'Saving Product...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
