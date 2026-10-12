import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function ToastNotification({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type !== 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div
        className={`flex items-start space-x-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md ${
          isSuccess
            ? 'bg-neutral-900/95 text-white border-white/10'
            : 'bg-rose-950/95 text-white border-rose-800/40'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {isSuccess ? (
            <CheckCircle2 size={18} className="text-emerald-400" />
          ) : (
            <AlertCircle size={18} className="text-rose-400" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-2">
          {toast.title && <h5 className="text-xs font-semibold tracking-wide uppercase">{toast.title}</h5>}
          <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">{toast.message}</p>
        </div>

        <button
          onClick={onClose}
          className="shrink-0 p-1 rounded-lg text-neutral-400 hover:text-white transition-colors"
          aria-label="Dismiss toast"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

