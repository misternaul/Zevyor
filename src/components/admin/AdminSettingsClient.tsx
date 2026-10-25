'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateStoreSettings } from '@/app/actions/admin-settings';
import { Sliders, Mail, MessageCircle, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

interface AdminSettingsClientProps {
  settings: Record<string, string>;
  canEdit: boolean;
  resendConfigured: boolean;
  emailLogs: any[];
}

export default function AdminSettingsClient({
  settings: initialSettings,
  canEdit,
  resendConfigured,
  emailLogs,
}: AdminSettingsClientProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, string>>({
    brandName: initialSettings.brandName || 'Zevyor',
    whatsappNumber: initialSettings.whatsappNumber || '923000000000',
    contactEmail: initialSettings.contactEmail || 'support@zevyor.com',
    announcementBar:
      initialSettings.announcementBar ||
      'Complimentary Nationwide Delivery on Orders Above Rs. 5,000 | Cash on Delivery Available',
    announcementVisible: initialSettings.announcementVisible || 'true',
    heroHeading: initialSettings.heroHeading || 'Commanding Elegance. Authentic Craft.',
    heroSubheading:
      initialSettings.heroSubheading ||
      'Precision chronographs and artisanal cashmere shawls crafted for the modern gentleman.',
    heroButtonText: initialSettings.heroButtonText || 'Explore Collection',
    heroButtonLink: initialSettings.heroButtonLink || '/shop',
    heroImageDesktop:
      initialSettings.heroImageDesktop ||
      'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=2000&q=85',
    brandIntroduction: initialSettings.brandIntroduction || '',
    policyShipping: initialSettings.policyShipping || '',
    policyReturns: initialSettings.policyReturns || '',
    policyPrivacy: initialSettings.policyPrivacy || '',
    policyTerms: initialSettings.policyTerms || '',
  });

  const [activeTab, setActiveTab] = useState<'GENERAL' | 'HERO' | 'POLICIES' | 'EMAIL'>('GENERAL');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const res = await updateStoreSettings(formData);
    setLoading(false);

    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    } else {
      alert(res.error || 'Failed to update store settings');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-brand-cream-dark space-x-2 text-xs font-semibold uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setActiveTab('GENERAL')}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === 'GENERAL'
              ? 'border-brand-burgundy text-brand-burgundy'
              : 'border-transparent text-brand-grey hover:text-brand-black'
          }`}
        >
          Store Identity & Contact
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('HERO')}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === 'HERO'
              ? 'border-brand-burgundy text-brand-burgundy'
              : 'border-transparent text-brand-grey hover:text-brand-black'
          }`}
        >
          Homepage Hero & Announcement
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('POLICIES')}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === 'POLICIES'
              ? 'border-brand-burgundy text-brand-burgundy'
              : 'border-transparent text-brand-grey hover:text-brand-black'
          }`}
        >
          Policy Pages Content
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('EMAIL')}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === 'EMAIL'
              ? 'border-brand-burgundy text-brand-burgundy'
              : 'border-transparent text-brand-grey hover:text-brand-black'
          }`}
        >
          Resend Transactional Email
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab 1: General */}
        {activeTab === 'GENERAL' && (
          <div className="bg-white p-6 sm:p-8 border border-brand-cream-dark space-y-4 shadow-sm text-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-2">
              Brand Identity & Customer Support Concierge
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block uppercase font-bold text-brand-black mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  required
                  disabled={!canEdit}
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-brand-black mb-1">
                  Official WhatsApp Contact Number (for customer chat)
                </label>
                <input
                  type="text"
                  required
                  disabled={!canEdit}
                  placeholder="923000000000"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border p-2 font-mono"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-brand-black mb-1">
                  Support Contact Email
                </label>
                <input
                  type="email"
                  required
                  disabled={!canEdit}
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block uppercase font-bold text-brand-black mb-1">
                Concise Brand Story Introduction (Displayed on Homepage & Heritage)
              </label>
              <textarea
                rows={3}
                disabled={!canEdit}
                value={formData.brandIntroduction}
                onChange={(e) => setFormData({ ...formData, brandIntroduction: e.target.value })}
                className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Hero & Announcement */}
        {activeTab === 'HERO' && (
          <div className="bg-white p-6 sm:p-8 border border-brand-cream-dark space-y-4 shadow-sm text-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-2">
              Storefront Hero Section & Top Announcement Bar
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block uppercase font-bold text-brand-black mb-1">
                  Top Announcement Bar Message
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.announcementBar}
                  onChange={(e) => setFormData({ ...formData, announcementBar: e.target.value })}
                  className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canEdit}
                    checked={formData.announcementVisible === 'true'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        announcementVisible: e.target.checked ? 'true' : 'false',
                      })
                    }
                    className="text-brand-burgundy focus:ring-brand-burgundy"
                  />
                  <span>Display Announcement Bar on Storefront</span>
                </label>
              </div>

              <div className="pt-4 border-t border-brand-cream-dark space-y-4">
                <div>
                  <label className="block uppercase font-bold text-brand-black mb-1">
                    Hero Section Heading
                  </label>
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={formData.heroHeading}
                    onChange={(e) => setFormData({ ...formData, heroHeading: e.target.value })}
                    className="w-full bg-brand-cream-light border border-brand-grey-border p-2 text-sm font-serif"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-brand-black mb-1">
                    Hero Subtitle / Supporting Text
                  </label>
                  <textarea
                    rows={2}
                    disabled={!canEdit}
                    value={formData.heroSubheading}
                    onChange={(e) => setFormData({ ...formData, heroSubheading: e.target.value })}
                    className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase font-bold text-brand-black mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={formData.heroButtonText}
                      onChange={(e) =>
                        setFormData({ ...formData, heroButtonText: e.target.value })
                      }
                      className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-bold text-brand-black mb-1">
                      Button Link Destination
                    </label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={formData.heroButtonLink}
                      onChange={(e) =>
                        setFormData({ ...formData, heroButtonLink: e.target.value })
                      }
                      className="w-full bg-brand-cream-light border border-brand-grey-border p-2 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase font-bold text-brand-black mb-1">
                    Desktop Hero Lifestyle Image URL
                  </label>
                  <input
                    type="url"
                    disabled={!canEdit}
                    value={formData.heroImageDesktop}
                    onChange={(e) =>
                      setFormData({ ...formData, heroImageDesktop: e.target.value })
                    }
                    className="w-full bg-brand-cream-light border border-brand-grey-border p-2 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Policies */}
        {activeTab === 'POLICIES' && (
          <div className="bg-white p-6 sm:p-8 border border-brand-cream-dark space-y-5 shadow-sm text-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-black border-b border-brand-cream-dark pb-2">
              Policy & Legal Content
            </h3>

            <div>
              <label className="block uppercase font-bold text-brand-black mb-1">
                Shipping & Delivery Policy Text
              </label>
              <textarea
                rows={3}
                disabled={!canEdit}
                value={formData.policyShipping}
                onChange={(e) => setFormData({ ...formData, policyShipping: e.target.value })}
                className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
              />
            </div>

            <div>
              <label className="block uppercase font-bold text-brand-black mb-1">
                Returns & Exchange Policy Text
              </label>
              <textarea
                rows={3}
                disabled={!canEdit}
                value={formData.policyReturns}
                onChange={(e) => setFormData({ ...formData, policyReturns: e.target.value })}
                className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
              />
            </div>

            <div>
              <label className="block uppercase font-bold text-brand-black mb-1">
                Privacy Policy Text
              </label>
              <textarea
                rows={3}
                disabled={!canEdit}
                value={formData.policyPrivacy}
                onChange={(e) => setFormData({ ...formData, policyPrivacy: e.target.value })}
                className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
              />
            </div>

            <div>
              <label className="block uppercase font-bold text-brand-black mb-1">
                Terms & Conditions Text
              </label>
              <textarea
                rows={3}
                disabled={!canEdit}
                value={formData.policyTerms}
                onChange={(e) => setFormData({ ...formData, policyTerms: e.target.value })}
                className="w-full bg-brand-cream-light border border-brand-grey-border p-2"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Resend Email Status */}
        {activeTab === 'EMAIL' && (
          <div className="bg-white p-6 sm:p-8 border border-brand-cream-dark space-y-6 shadow-sm text-xs">
            <div className="border-b border-brand-cream-dark pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-black flex items-center space-x-2">
                <Mail className="w-4 h-4 text-brand-burgundy" />
                <span>Resend Transactional Email Engine Status</span>
              </h3>
            </div>

            <div
              className={`p-4 border flex items-start space-x-3 ${
                resendConfigured
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex-1 space-y-1">
                <p className="font-bold">
                  {resendConfigured
                    ? '✔ RESEND_API_KEY is configured in server environment variables.'
                    : '⚠ RESEND_API_KEY is currently empty in server environment variables.'}
                </p>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  {resendConfigured
                    ? 'Automatic customer order confirmations and admin notifications are currently active.'
                    : 'The storefront continues to accept Cash on Delivery orders seamlessly without email blocking. To enable transactional emails, enter your Resend API key into your .env or Vercel environment variables.'}
                </p>
              </div>
            </div>

            <div className="bg-brand-cream-light p-4 border border-brand-cream-dark space-y-2">
              <strong className="text-brand-black">Setup Guide for Store Owner:</strong>
              <ol className="list-decimal pl-5 space-y-1 text-brand-grey text-[11px] leading-relaxed">
                <li>Create an account at resend.com and generate an API key.</li>
                <li>Add your verified domain (or use onboarding@resend.dev for initial sandbox testing).</li>
                <li>Set RESEND_API_KEY=re_xxxx and RESEND_FROM_EMAIL=orders@yourdomain.com in Vercel settings.</li>
                <li>No email failure will ever drop or corrupt an order record.</li>
              </ol>
            </div>

            {/* Email Dispatch Logs */}
            <div className="space-y-3">
              <h4 className="font-bold uppercase tracking-wider text-brand-black">
                Recent Transactional Email Dispatch Logs ({emailLogs.length})
              </h4>
              <div className="overflow-x-auto border border-brand-cream-dark">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-brand-cream uppercase text-brand-black">
                    <tr>
                      <th className="p-2">Type</th>
                      <th className="p-2">Recipient</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Notes / Error Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-cream-dark">
                    {emailLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-brand-grey">
                          No email dispatch attempts logged yet.
                        </td>
                      </tr>
                    ) : (
                      emailLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="p-2 font-mono">{log.emailType}</td>
                          <td className="p-2">{log.recipient}</td>
                          <td className="p-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                log.status === 'SENT'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="p-2 text-brand-grey truncate max-w-xs">
                            {log.errorMessage || 'Delivered successfully'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Submit Bar */}
        {canEdit && activeTab !== 'EMAIL' && (
          <div className="flex items-center justify-between bg-white p-4 border border-brand-cream-dark">
            <span className="text-xs text-brand-grey">
              Modifications apply to storefront layouts and customer policies immediately.
            </span>
            <div className="flex items-center space-x-3">
              {saved && (
                <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settings Saved!</span>
                </span>
              )}
              <button
                type="submit"
                disabled={loading}
                className="bg-brand-burgundy hover:bg-brand-burgundy-dark text-white px-6 py-2.5 text-xs uppercase tracking-wider font-semibold shadow transition"
              >
                {loading ? 'Saving Changes...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
