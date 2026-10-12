import React, { useState } from 'react';
import { Lock, Mail, Store, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';

export default function AdminLoginForm({ onLogin, onNavigateToStorefront }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await onLogin(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-neutral-100 selection:bg-white selection:text-black antialiased">
      <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-3xl p-7 sm:p-9 shadow-2xl relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white text-neutral-950 font-black text-sm flex items-center justify-center shadow-sm">
              TS
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">TechnicalSky Console</h2>
              <span className="text-[11px] text-neutral-400 font-medium block">
                Production Gateway
              </span>
            </div>
          </div>

          <button
            onClick={onNavigateToStorefront}
            className="p-2 text-xs text-neutral-400 hover:text-white transition-colors flex items-center space-x-1"
            title="Return to public storefront"
          >
            <Store size={16} />
          </button>
        </div>

        {/* Security Alert / Notice */}
        <div className="my-5 p-3 rounded-xl bg-white/5 border border-white/10 flex items-start space-x-2.5 text-xs text-neutral-300">
          <ShieldAlert size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            Protected by <span className="text-white font-semibold">HttpOnly Session Cookies</span> and rate-limited Argon2id/Bcrypt authentication.
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-neutral-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Master Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-neutral-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold bg-white text-neutral-950 hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Console</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-center text-[11px] text-neutral-500">
          <span>Encrypted Session</span>
          <button
            type="button"
            onClick={onNavigateToStorefront}
            className="hover:text-white transition-colors underline"
          >
            ← Back to Storefront
          </button>
        </div>
      </div>
    </div>
  );
}

