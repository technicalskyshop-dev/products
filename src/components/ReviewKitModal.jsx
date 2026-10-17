import React, { useState, useEffect, useMemo } from 'react';
import { X, ExternalLink, Copy, Check, Play, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { resolveTheme } from '../data/themes';

export default function ReviewKitModal() {
  const { activeKitModal, closeKitModal, products, settings } = useStore();
  const [copied, setCopied] = useState(false);
  const theme = resolveTheme(settings);
  const isDark = theme.isDark;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeKitModal();
    };
    if (activeKitModal) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent background body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activeKitModal, closeKitModal]);

  // Resolve products for this kit
  const kitProducts = useMemo(() => {
    if (!activeKitModal) return [];
    const pIds = Array.isArray(activeKitModal.productIds) ? activeKitModal.productIds : [];
    
    // Find products in store matching IDs
    const matched = pIds
      .map((id) => products.find((p) => p.id === id || p.slug === id))
      .filter(Boolean);

    // If some IDs weren't matched in store (e.g. initial demo), match with first available products
    if (matched.length === 0 && products.length > 0) {
      return products.slice(0, 5);
    }
    return matched;
  }, [activeKitModal, products]);

  if (!activeKitModal) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://technicalskystuff.com';
  const shareableUrl = `${currentOrigin}?kit=${activeKitModal.slug}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const getAffiliateUrl = (product, platform) => {
    const amazonTag = settings?.defaultAmazonTag || 'technicalsky-21';
    const flipkartTag = settings?.defaultFlipkartTag || 'technicalsky';

    if (platform === 'amazon') {
      const url = product.amazonUrl || '';
      if (!url) return '';
      if (url.includes('tag=')) return url;
      return url.includes('?') ? `${url}&tag=${amazonTag}` : `${url}?tag=${amazonTag}`;
    }

    if (platform === 'flipkart') {
      const url = product.flipkartUrl || '';
      if (!url) return '';
      if (url.includes('affid=')) return url;
      return url.includes('?') ? `${url}&affid=${flipkartTag}` : `${url}?affid=${flipkartTag}`;
    }

    return '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={closeKitModal}
    >
      <div
        className={`w-full max-w-2xl max-h-[92vh] rounded-[28px] sm:rounded-[36px] shadow-2xl border flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-neutral-900/95 border-white/15 text-white'
            : 'bg-white/95 border-neutral-200/80 text-neutral-900'
        }`}
        style={{
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-neutral-200/60 dark:border-white/10 shrink-0 relative">
          {/* Close Button */}
          <button
            onClick={closeKitModal}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
            aria-label="Close review kit popup"
          >
            <X size={18} />
          </button>

          <div className="pr-10">
            <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center space-x-1">
                <span>🎬</span>
                <span>{activeKitModal.badgeText || 'Reel / Video Review'}</span>
              </span>
              <span className="text-xs text-neutral-400 font-medium">
                • {kitProducts.length} {kitProducts.length === 1 ? 'Reviewed Item' : 'Reviewed Items'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {activeKitModal.title}
            </h2>

            {activeKitModal.subtitle && (
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                {activeKitModal.subtitle}
              </p>
            )}
          </div>

          {/* Action Row: Video Reel Link & Copy Shareable Link */}
          <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-neutral-100 dark:border-white/5">
            {/* Shareable Link Box */}
            <div className="flex items-center space-x-2 min-w-0 bg-neutral-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-neutral-200/60 dark:border-white/5 flex-1">
              <span className="text-[11px] text-neutral-400 font-medium shrink-0">1-Click Link:</span>
              <span className="text-xs font-mono font-medium truncate text-indigo-600 dark:text-indigo-400 select-all">
                {shareableUrl.replace(/^https?:\/\//, '')}
              </span>
              <button
                onClick={handleCopyLink}
                className="shrink-0 p-1 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Copy shareable link"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>

            {/* Optional Watch Video Button */}
            {activeKitModal.videoUrl && (
              <a
                href={activeKitModal.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 transition-opacity shrink-0 justify-center"
              >
                <Play size={12} className="fill-current" />
                <span>Watch Reel</span>
              </a>
            )}
          </div>
        </div>

        {/* Product Items List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scroll">
          {kitProducts.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-xs">
              No products attached to this kit yet.
            </div>
          ) : (
            kitProducts.map((product, index) => {
              const amazonAffiliate = getAffiliateUrl(product, 'amazon');
              const flipkartAffiliate = getAffiliateUrl(product, 'flipkart');

              return (
                <div
                  key={product.id || index}
                  className={`p-3 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDark
                      ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                      : 'bg-neutral-50/80 border-neutral-200/70 hover:bg-white hover:shadow-xs'
                  }`}
                >
                  {/* Left: Product Thumbnail & Details */}
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl object-contain bg-white border border-neutral-200/80 p-1"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80';
                        }}
                      />
                      <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-neutral-900">
                        {index + 1}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          {product.categoryLabel || (typeof product.category === 'string' ? product.category : product.category?.name) || 'Product'}
                        </span>
                        {product.isFeatured && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400/10 text-amber-500 border border-amber-400/20">
                            ★ Featured
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold truncate mt-0.5" title={product.name}>
                        {product.name}
                      </h4>

                      {/* Pricing */}
                      <div className="flex items-baseline space-x-2 mt-1">
                        <span className="text-sm font-extrabold text-neutral-900 dark:text-white">
                          ₹{Number(product.priceValue || product.displayPrice?.replace(/[^0-9]/g, '') || 0).toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-neutral-400 line-through">
                            ₹{Number(product.originalPrice.replace(/[^0-9]/g, '') || 0).toLocaleString('en-IN')}
                          </span>
                        )}
                        {product.originalPrice && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                            Verified Deal
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Instant Buy Affiliate Buttons */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    {amazonAffiliate ? (
                      <a
                        href={amazonAffiliate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-[#FF9900] hover:bg-[#ff8800] text-black text-xs font-bold shadow-xs hover:shadow-sm active:scale-95 transition-all flex items-center space-x-1 cursor-pointer"
                        title="Buy on Amazon"
                      >
                        <span>Amazon</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : null}

                    {flipkartAffiliate ? (
                      <a
                        href={flipkartAffiliate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-[#2874F0] hover:bg-[#1a64df] text-white text-xs font-bold shadow-xs hover:shadow-sm active:scale-95 transition-all flex items-center space-x-1 cursor-pointer"
                        title="Buy on Flipkart"
                      >
                        <span>Flipkart</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : null}

                    {!amazonAffiliate && !flipkartAffiliate && (
                      <span className="text-xs text-neutral-400 italic">Link coming soon</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-200/60 dark:border-white/10 flex items-center justify-between text-xs shrink-0 bg-neutral-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center space-x-1.5 text-neutral-400">
            <Sparkles size={13} className="text-amber-500" />
            <span>Verified affiliate links. Direct delivery from official stores.</span>
          </div>
          <button
            onClick={closeKitModal}
            className="px-5 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
