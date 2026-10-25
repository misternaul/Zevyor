'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { loginWithPasscode } from '@/app/actions/admin-auth';
import { Lock, ShieldAlert, ArrowRight, KeyRound } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginWithPasscode(passcode);
      if (res.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(res.error || 'Authentication failed.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 border border-neutral-800 shadow-2xl">
        <div className="text-center space-y-3">
          <div className="relative h-12 w-40 mx-auto">
            <Image
              src="/assets/zevyor-official-logo.png"
              alt="Zevyor"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-brand-burgundy font-bold bg-brand-burgundy/10 px-2.5 py-0.5 border border-brand-burgundy/20">
            Administrative Control Panel
          </span>
          <h1 className="text-xl font-serif text-brand-black">Secure Passcode Authentication</h1>
          <p className="text-xs text-brand-grey leading-relaxed">
            Enter your authorized administrative passcode to access the operations console.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-black mb-2 flex items-center justify-between">
              <span>Admin Passcode</span>
              <KeyRound className="w-3.5 h-3.5 text-brand-grey" />
            </label>
            <input
              type="password"
              required
              autoFocus
              placeholder="••••••••••••"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-brand-cream-light border border-brand-grey-border px-4 py-3 text-base text-brand-black tracking-widest focus:outline-none focus:border-brand-burgundy"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-burgundy hover:bg-brand-burgundy-dark disabled:bg-gray-400 text-white py-3.5 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 shadow-md transition"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Verifying Passcode...' : 'Enter Admin Console'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-brand-cream-dark text-center text-[11px] text-brand-grey space-y-1">
          <p>Protected by cryptographic hashing & rate-limited lockout</p>
          <p className="text-[10px] text-brand-grey-light">
            Owner recovery: use the server bootstrap script if credentials are lost.
          </p>
        </div>
      </div>
    </div>
  );
}
