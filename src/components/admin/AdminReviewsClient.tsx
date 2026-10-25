'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { moderateReview } from '@/app/actions/admin-settings';
import { Star, CheckCircle, XCircle } from 'lucide-react';

export default function AdminReviewsClient({
  reviews,
  canEdit,
}: {
  reviews: any[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleModerate = async (reviewId: string, isApproved: boolean) => {
    setLoadingId(reviewId);
    const res = await moderateReview({ reviewId, isApproved });
    setLoadingId(null);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Failed to update review status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-brand-cream-dark overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-brand-cream uppercase text-brand-black font-semibold border-b border-brand-cream-dark">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Review Feedback</th>
              <th className="p-3">Verified Purchase</th>
              <th className="p-3">Status</th>
              {canEdit && <th className="p-3 text-right">Moderation</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-cream-dark">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-brand-grey">
                  No customer reviews submitted yet.
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.id} className="hover:bg-brand-cream-light/60 transition">
                  <td className="p-3 font-semibold text-brand-black">{r.product.name}</td>
                  <td className="p-3 font-medium">{r.customerName}</td>
                  <td className="p-3">
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-brand-grey max-w-sm italic">
                    &ldquo;{r.reviewText}&rdquo;
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold ${
                        r.isVerifiedPurchase ? 'text-emerald-700' : 'text-brand-grey'
                      }`}
                    >
                      {r.isVerifiedPurchase ? 'Verified COD Buyer' : 'Guest'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                        r.isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.isApproved ? 'Approved & Public' : 'Pending Moderation'}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {!r.isApproved ? (
                          <button
                            onClick={() => handleModerate(r.id, true)}
                            disabled={loadingId === r.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-[11px] font-semibold"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleModerate(r.id, false)}
                            disabled={loadingId === r.id}
                            className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 px-3 py-1 rounded text-[11px] font-semibold"
                          >
                            Unpublish
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
