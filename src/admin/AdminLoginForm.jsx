import React, { useState } from 'react';
import { Lock, Mail, Store, ShieldAlert, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';

export default function AdminLoginForm({ onLogin, onNavigateToStorefront }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError(result.error || 'Invalid credentials. Please verify and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] relative flex flex-col justify-center items-center px-4 py-8 sm:p-6 text-neutral-100 selection:bg-white selection:text-black antialiased overflow-x-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] sm:w-[680px] h-[360px] bg-gradient-to-tr from-violet-600/15 via-indigo-500/10 to-transparent blur-[110px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600/10 blur-[90px] rounded-full pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <div className="w-full max-w-[430px] bg-neutral-900/80 backdrop-blur-2xl border border-white/[0.12] rounded-[28px] sm:rounded-[32px] p-6 sm:p-9 shadow-[0_24px_70px_rgba(0,0,0,0.65),0_0_1px_rgba(255,255,255,0.25)] relative overflow-hidden transition-all duration-300">
        {/* Top Specular Gradient Highlight */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-transparent pointer-events-none" />

        {/* Top Header */}
        <div className="relative flex items-center justify-between pb-6 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white via-neutral-100 to-neutral-300 text-neutral-950 font-black text-sm flex items-center justify-center shadow-[0_4px_16px_rgba(255,255,255,0.25)] ring-1 ring-white/20 shrink-0">
              TS
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h2 className="text-base font-bold text-white tracking-tight leading-tight truncate">
                  TechnicalSky
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-neutral-300 border border-white/10">
                  Console
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 font-medium block mt-0.5">
                Production Administration
              </span>
            </div>
          </div>

          <button
            onClick={onNavigateToStorefront}
            className="p-2 sm:p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] text-neutral-400 hover:text-white transition-all border border-white/[0.06] cursor-pointer flex items-center space-x-1 shrink-0"
            title="Return to public storefront"
            aria-label="Return to storefront"
          >
            <Store size={15} />
          </button>
        </div>

        {/* Security Alert Badge */}
        <div className="relative my-5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center space-x-2.5 text-xs text-neutral-300 shadow-inner">
          <div className="relative flex h-2.5 w-2.5 shrink-0 ml-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </div>
          <div className="text-[11px] sm:text-xs text-neutral-300 leading-snug">
            Protected by <span className="text-white font-semibold">HttpOnly Session Cookies</span> & Argon2id/Bcrypt.
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start space-x-2 animate-in fade-in duration-200">
            <ShieldAlert size={15} className="text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5 ml-0.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-neutral-500 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 bg-neutral-950/80 border border-white/[0.12] rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5 ml-0.5">
              Master Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-neutral-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-11 py-3 bg-neutral-950/80 border border-white/[0.12] rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-white text-neutral-950 hover:bg-neutral-100 active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-[0_4px_20px_rgba(255,255,255,0.18)]"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin text-neutral-900" />
                <span>Authenticating Session...</span>
              </>
            ) : (
              <>
                <span>Sign In to Console</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>Encrypted Session</span>
          </div>

          <button
            type="button"
            onClick={onNavigateToStorefront}
            className="hover:text-white transition-colors flex items-center space-x-1 cursor-pointer group"
          >
            <span>← Storefront</span>
          </button>
        </div>
      </div>

      {/* Bottom Security Notice */}
      <p className="text-[11px] text-neutral-600 mt-6 text-center max-w-xs">
        Authorized administrator access only. All authentication events are cryptographically signed and logged.
      </p>
    </div>
  );
}

