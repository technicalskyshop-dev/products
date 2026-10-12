import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowUpRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function StoreChooserModal({ product, onClose }) {
  // Lock body scroll while modal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!product) return null;

  const handleStoreClick = (platform) => {
    const url = `/api/go/${product.id}/${platform}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose?.();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-fade-soft"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Select Store"
    >
      {/* Modal Dialog Card: Bottom-sheet on mobile, centered luxury glass capsule on desktop */}
      <div
        className="relative w-full sm:max-w-md bg-[#19191D] sm:bg-[#1C1C21]/95 text-white rounded-t-[28px] sm:rounded-[28px] border-t sm:border border-white/[0.14] shadow-[0_-12px_45px_rgba(0,0,0,0.6)] sm:shadow-[0_25px_65px_rgba(0,0,0,0.65)] p-5 sm:p-6 pb-8 sm:pb-6 flex flex-col text-left animate-sheet-up sm:animate-modal-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-3.5 sm:hidden" />

        {/* Header with Close Button */}
        <div className="flex items-start justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3 min-w-0 pr-3">
            {/* Crisp Square Photo Window */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1.5 shrink-0 flex items-center justify-center overflow-hidden border border-black/5 shadow-inner">
              <img
                src={product.imageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Product Meta */}
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/25">
                <ShieldCheck size={11} className="text-purple-400" />
                <span>Dual Store Link</span>
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 mt-1 leading-snug">
                {product.name}
              </h3>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-xs sm:text-sm font-extrabold text-neutral-100">
                  {product.displayPrice}
                </span>
                {product.originalPrice && product.originalPrice !== product.displayPrice && (
                  <span className="text-[11px] text-neutral-400 line-through">
                    {product.originalPrice}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Prompt */}
        <div className="py-3">
          <p className="text-xs font-semibold text-neutral-300 text-center sm:text-left">
            Select store to view price & buy:
          </p>
        </div>

        {/* The Two Official Store Buttons */}
        <div className="space-y-2.5">
          {/* AMAZON BUTTON */}
          <button
            type="button"
            onClick={() => handleStoreClick('amazon')}
            className="w-full group text-left relative overflow-hidden flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#232F3E] hover:bg-[#2c3a4d] border border-amber-400/25 shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center space-x-3 min-w-0">
              {/* Amazon Brand Pill */}
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-black/5 font-black text-neutral-900 text-xs tracking-tighter">
                <span className="text-neutral-950 font-bold text-[13px]">amz</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm text-white tracking-tight">Amazon India</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                    Prime
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 truncate">
                  Fast doorstep delivery & verified seller
                </p>
              </div>
            </div>

            {/* Action Pill */}
            <div className="ml-2 shrink-0 px-3 py-1.5 rounded-xl bg-amber-400 group-hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center space-x-1 shadow-sm transition-all group-hover:translate-x-0.5">
              <span>Open</span>
              <ArrowUpRight size={13} strokeWidth={2.5} />
            </div>
          </button>

          {/* FLIPKART BUTTON */}
          <button
            type="button"
            onClick={() => handleStoreClick('flipkart')}
            className="w-full group text-left relative overflow-hidden flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#1B5CC4] hover:bg-[#2068DC] border border-blue-300/30 shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center space-x-3 min-w-0">
              {/* Flipkart Brand Pill */}
              <div className="w-10 h-10 rounded-xl bg-[#FFE500] flex items-center justify-center shrink-0 shadow-sm border border-yellow-400/30 font-black text-blue-700 text-xs italic tracking-tighter">
                <span className="text-[#1B5CC4] font-black text-[13px]">fk</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm text-white tracking-tight">Flipkart</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-yellow-400/25 text-yellow-300 font-bold border border-yellow-400/30">
                    Assured
                  </span>
                </div>
                <p className="text-[11px] text-blue-100 truncate">
                  SuperCoins & authorized brand partner
                </p>
              </div>
            </div>

            {/* Action Pill */}
            <div className="ml-2 shrink-0 px-3 py-1.5 rounded-xl bg-[#FFE500] group-hover:bg-[#FFF04D] text-neutral-950 font-bold text-xs flex items-center space-x-1 shadow-sm transition-all group-hover:translate-x-0.5">
              <span>Open</span>
              <ArrowUpRight size={13} strokeWidth={2.5} />
            </div>
          </button>
        </div>

        {/* Security / Partner Guarantee */}
        <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-center space-x-1.5 text-[11px] text-neutral-400 text-center">
          <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
          <span>Direct official store redirect. 100% secure checkout.</span>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}
