import React from 'react';
import { Play, Sparkles, Layers, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { resolveTheme } from '../data/themes';

export default function ReviewKitsBanner() {
  const { reviewKits, openKitModal, products, settings } = useStore();
  const theme = resolveTheme(settings);
  const isDark = theme.isDark;

  if (!reviewKits || reviewKits.length === 0) return null;

  // Find the top featured review kit
  const featuredKit = reviewKits.find((k) => k.isFeatured) || reviewKits[0];
  if (!featuredKit) return null;

  // Resolve products for this kit to show avatar thumbnails
  const pIds = Array.isArray(featuredKit.productIds) ? featuredKit.productIds : [];
  const kitProducts = pIds
    .map((id) => products.find((p) => p.id === id || p.slug === id))
    .filter(Boolean);

  const displayProducts = kitProducts.length > 0 ? kitProducts : products.slice(0, 5);
  const itemCount = displayProducts.length;

  return (
    <div className="w-full mb-6">
      <div
        className={`w-full rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 border transition-all relative overflow-hidden shadow-sm hover:shadow-md ${
          isDark
            ? 'bg-white/[0.04] border-white/10 hover:border-white/20 text-white'
            : 'bg-white/80 border-neutral-200/80 hover:border-neutral-300 text-neutral-900'
        }`}
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Subtle Ambient Decorative Gradient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          {/* Left: Kit Info & Stacked Badge */}
          <div className="flex items-start sm:items-center space-x-3.5 sm:space-x-4 min-w-0">
            {/* Reel / Video Icon Block */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-950 text-white flex flex-col items-center justify-center shrink-0 shadow-md relative overflow-hidden ring-1 ring-white/10">
              <span className="text-xl sm:text-2xl leading-none">🎬</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 mt-1 uppercase tracking-tight">
                {itemCount} Items
              </span>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500"></div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {featuredKit.badgeText || 'Featured Review Kit'}
                </span>
                <span className="text-xs text-neutral-400 hidden sm:inline">
                  • 1-Click Shop All Items
                </span>
              </div>

              <h3 className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight mt-0.5 truncate">
                {featuredKit.title}
              </h3>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                {featuredKit.subtitle || featuredKit.description || 'All items reviewed together. Tap once to view verified buy links.'}
              </p>
            </div>
          </div>

          {/* Right: Overlapping Product Thumbnails + 1-Click Trigger Button */}
          <div className="flex items-center justify-between lg:justify-end space-x-3 sm:space-x-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-200/50 dark:border-white/5">
            {/* Stacked Product Avatars */}
            {displayProducts.length > 0 && (
              <div className="flex -space-x-2.5 overflow-hidden py-1">
                {displayProducts.slice(0, 4).map((p, idx) => (
                  <img
                    key={p.id || idx}
                    src={p.imageUrl}
                    alt={p.name}
                    className="inline-block h-9 w-9 sm:h-10 sm:w-10 rounded-full ring-2 ring-white dark:ring-neutral-900 object-cover bg-white shadow-xs"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                ))}
                {displayProducts.length > 4 && (
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full ring-2 ring-white dark:ring-neutral-900 bg-neutral-900 text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center shadow-xs">
                    +{displayProducts.length - 4}
                  </div>
                )}
              </div>
            )}

            {/* 1-Click Main CTA Button */}
            <button
              onClick={() => openKitModal(featuredKit)}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white dark:text-neutral-900 hover:text-white dark:hover:text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap"
            >
              <span>⚡ View All {itemCount} Items</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
