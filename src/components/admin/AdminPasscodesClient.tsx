'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createStaffPasscode,
  updateStaffPasscodePermissions,
  togglePasscodeActive,
  deletePasscode,
} from '@/app/actions/admin-passcodes';
import { KeyRound, Shield, Plus, Edit2, Trash2, Power, X, Check } from 'lucide-react';

interface PasscodeRecord {
  id: string;
  label: string;
  isOwner: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  permissions: { module: string; canView: boolean; canEdit: boolean }[];
  _count: { sessions: number };
}

const ALL_MODULES = [
  { key: 'DASHBOARD', name: 'Dashboard Analytics' },
  { key: 'PRODUCTS', name: 'Product Catalogue' },
  { key: 'CATEGORIES', name: 'Category Architecture' },
  { key: 'INVENTORY', name: 'Stock & Inventory' },
  { key: 'ORDERS', name: 'Orders & Fulfillment (COD)' },
  { key: 'CUSTOMERS', name: 'Customer Records' },
  { key: 'COUPONS', name: 'Coupons & Discounts' },
  { key: 'BUNDLES', name: 'Promotional Bundles' },
  { key: 'DELIVERY', name: 'Delivery Tariffs & Zones' },
  { key: 'HOMEPAGE', name: 'Homepage & Banners' },
  { key: 'LOOKBOOK', name: 'Editorial Lookbook' },
  { key: 'REVIEWS', name: 'Review Moderation' },
  { key: 'SETTINGS', name: 'Store Settings & Policies' },
  { key: 'PASSCODES', name: 'Passcodes & Security (Owner)' },
  { key: 'AUDIT_LOGS', name: 'Administrative Audit Trail' },
];

export default function AdminPasscodesClient({
  passcodes,
  currentAdminId,
}: {
  passcodes: PasscodeRecord[];
  currentAdminId: string;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPc, setEditingPc] = useState<PasscodeRecord | null>(null);

  const [label, setLabel] = useState('');
  const [passcode, setPasscode] = useState('');
  const [permissions, setPermissions] = useState<
    Record<string, { canView: boolean; canEdit: boolean }>
  >({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingPc(null);
    setLabel('');
    setPasscode('');
    const initialPerms: Record<string, { canView: boolean; canEdit: boolean }> = {};
    ALL_MODULES.forEach((m) => {
      initialPerms[m.key] = { canView: false, canEdit: false };
    });
    setPermissions(initialPerms);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (pc: PasscodeRecord) => {
    setEditingPc(pc);
    setLabel(pc.label);
    setPasscode('');
    const existingPerms: Record<string, { canView: boolean; canEdit: boolean }> = {};
    ALL_MODULES.forEach((m) => {
      const match = pc.permissions.find((p) => p.module === m.key);
      existingPerms[m.key] = {
        canView: !!match?.canView,
        canEdit: !!match?.canEdit,
      };
    });
    setPermissions(existingPerms);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (editingPc) {
        const res = await updateStaffPasscodePermissions({
          passcodeId: editingPc.id,
          label,
          newPasscode: passcode.trim() || undefined,
          permissions,
        });

        if (res.success) {
          setModalOpen(false);
          router.refresh();
        } else {
          setError(res.error || 'Failed to update passcode.');
        }
      } else {
        const res = await createStaffPasscode({
          label,
          passcode,
          permissions,
        });

        if (res.success) {
          setModalOpen(false);
          router.refresh();
        } else {
          setError(res.error || 'Failed to create passcode.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (pc: PasscodeRecord) => {
    const action = pc.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} passcode "${pc.label}"?`)) return;

    const res = await togglePasscodeActive({
      passcodeId: pc.id,
      isActive: !pc.isActive,
    });

    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Failed to toggle passcode state.');
    }
  };

  const handleDelete = async (pc: PasscodeRecord) => {
    if (!confirm(`Permanently delete passcode "${pc.label}"? All associated sessions will be immediately invalidated.`)) {
      return;
    }

    const res = await deletePasscode(pc.id);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Failed to delete passcode.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-brand-grey max-w-xl">
          Create independently permissioned passcodes for inventory managers, order dispatch staff, or review moderators. Enforced on the server.
        </p>

        <button
          onClick={openCreateModal}
          className="bg-brand-burgundy hover:bg-brand-burgundy-dark text-white px-4 py-2.5 text-xs uppercase tracking-wider font-semibold flex items-center space-x-1.5 shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Passcode</span>
        </button>
      </div>

      {/* Passcodes Grid / Table */}
      <div className="bg-white border border-brand-cream-dark overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-brand-cream uppercase text-brand-black font-semibold border-b border-brand-cream-dark">
            <tr>
              <th className="p-3">Label / Name</th>
              <th className="p-3">Role Tier</th>
              <th className="p-3">Status</th>
              <th className="p-3">Active Sessions</th>
              <th className="p-3">Last Login</th>
              <th className="p-3">Granted Permissions</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-cream-dark">
            {passcodes.map((pc) => {
              const activeCount = pc.permissions.filter((p) => p.canView || p.canEdit).length;

              return (
                <tr key={pc.id} className="hover:bg-brand-cream-light/60 transition">
                  <td className="p-3 font-semibold text-brand-black">
                    <div className="flex items-center space-x-2">
                      <KeyRound className="w-4 h-4 text-brand-grey" />
                      <span>{pc.label}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                        pc.isOwner
                          ? 'bg-brand-burgundy text-white'
                          : 'bg-neutral-800 text-brand-cream'
                      }`}
                    >
                      {pc.isOwner ? 'Primary Owner' : 'Staff Passcode'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                        pc.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {pc.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-brand-grey">{pc._count.sessions}</td>
                  <td className="p-3 text-brand-grey">
                    {pc.lastLoginAt ? new Date(pc.lastLoginAt).toLocaleString() : 'Never'}
                  </td>
                  <td className="p-3 text-brand-black font-medium">
                    {pc.isOwner ? (
                      <span className="text-emerald-700 font-bold">All 15 Modules (Unrestricted)</span>
                    ) : (
                      <span>{activeCount} of {ALL_MODULES.length} modules</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {!pc.isOwner ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleActive(pc)}
                          className={`p-1.5 transition ${
                            pc.isActive
                              ? 'text-emerald-700 hover:text-red-600'
                              : 'text-red-600 hover:text-emerald-700'
                          }`}
                          title={pc.isActive ? 'Deactivate Passcode' : 'Activate Passcode'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(pc)}
                          className="p-1.5 text-brand-black hover:text-brand-burgundy transition"
                          title="Edit Permissions & Passcode"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pc)}
                          className="p-1.5 text-brand-grey hover:text-red-600 transition"
                          title="Delete Passcode"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-brand-grey italic">Permanent</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Passcode Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full border border-brand-cream-dark shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-brand-cream-dark pb-3">
              <h2 className="text-lg font-serif text-brand-black">
                {editingPc ? `Configure Passcode: ${editingPc.label}` : 'Create Staff Passcode'}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-brand-grey" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {error && <div className="p-2.5 bg-red-50 text-red-700 text-xs">{error}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-brand-black mb-1">
                    Passcode Identifier / Staff Label *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Order Dispatcher - Karachi"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full bg-brand-cream-light border border-brand-grey-border px-3 py-2 text-sm focus:outline-none focus:border-brand-burgundy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-brand-black mb-1">
                    {editingPc ? 'Change Secret Passcode (Leave blank to keep current)' : 'Secret Passcode *'}
                  </label>
                  <input
                    type="password"
                    required={!editingPc}
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full bg-brand-cream-light border border-brand-grey-border px-3 py-2 text-sm focus:outline-none focus:border-brand-burgundy"
                  />
                </div>
              </div>

              {/* Granular Permission Matrix */}
              <div className="space-y-3 pt-4 border-t border-brand-cream-dark">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-black">
                    Granular Access Matrix (View vs Editor Permissions)
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const allView: Record<string, { canView: boolean; canEdit: boolean }> = {};
                      ALL_MODULES.forEach((m) => {
                        allView[m.key] = { canView: true, canEdit: false };
                      });
                      setPermissions(allView);
                    }}
                    className="text-[11px] text-brand-burgundy font-semibold hover:underline"
                  >
                    Set All to View-Only
                  </button>
                </div>

                <div className="border border-brand-cream-dark divide-y divide-brand-cream-dark">
                  {ALL_MODULES.map((m) => {
                    const current = permissions[m.key] || { canView: false, canEdit: false };

                    return (
                      <div
                        key={m.key}
                        className="p-3 bg-brand-cream-light/40 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-2"
                      >
                        <span className="font-semibold text-brand-black">{m.name}</span>

                        <div className="flex items-center space-x-6">
                          {/* No Access */}
                          <label className="flex items-center space-x-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name={`perm_${m.key}`}
                              checked={!current.canView && !current.canEdit}
                              onChange={() =>
                                setPermissions({
                                  ...permissions,
                                  [m.key]: { canView: false, canEdit: false },
                                })
                              }
                              className="text-brand-grey focus:ring-brand-burgundy"
                            />
                            <span className="text-brand-grey">No Access</span>
                          </label>

                          {/* View Only */}
                          <label className="flex items-center space-x-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name={`perm_${m.key}`}
                              checked={current.canView && !current.canEdit}
                              onChange={() =>
                                setPermissions({
                                  ...permissions,
                                  [m.key]: { canView: true, canEdit: false },
                                })
                              }
                              className="text-brand-burgundy focus:ring-brand-burgundy"
                            />
                            <span className="text-brand-black">View-Only</span>
                          </label>

                          {/* Editor / Full */}
                          <label className="flex items-center space-x-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name={`perm_${m.key}`}
                              checked={current.canEdit}
                              onChange={() =>
                                setPermissions({
                                  ...permissions,
                                  [m.key]: { canView: true, canEdit: true },
                                })
                              }
                              className="text-brand-burgundy focus:ring-brand-burgundy"
                            />
                            <span className="text-brand-burgundy font-bold">Editor (Read & Write)</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
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
                  {loading ? 'Saving Configuration...' : 'Save Passcode & Permissions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
