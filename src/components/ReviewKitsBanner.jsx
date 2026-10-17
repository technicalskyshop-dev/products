import React from 'react';
import { Play, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
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

  const displayProducts = kitProducts.length > 0 ? kitProducts : products.slice(0, 4);
  const itemCount = displayProducts.length;

  return (
    <div className="w-full mb-6 sm:mb-8">
      {/* 
        Ultra-Luxury Apple VisionOS / Liquid Glass Showcase Container
      */}
      <div
        className={`relative w-full rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 md:p-7 overflow-hidden transition-all duration-300 group select-none ${
          isDark
            ? 'bg-neutral-900/60 border border-white/15 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.12)]'
            : 'bg-white/55 hover:bg-white/65 border border-white/90 text-neutral-900 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)]'
        }`}
        style={{
          backdropFilter: 'blur(32px) saturate(190%)',
          WebkitBackdropFilter: 'blur(32px) saturate(190%)',
        }}
      >
        {/* Specular Glass Highlight at Top Rim */}
        <div
          className={`absolute inset-x-0 top-0 h-14 bg-gradient-to-b ${
            isDark ? 'from-white/15' : 'from-white/80 via-white/30'
          } to-transparent pointer-events-none rounded-t-[24px] sm:rounded-t-[32px]`}
        />

        {/* Ambient Color Atmosphere (Soft Iridescent Glow behind the frosted glass) */}
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-gradient-to-br from-indigo-500/12 via-purple-500/8 to-cyan-400/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-gradient-to-tr from-cyan-400/10 via-indigo-400/8 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Inner Content Grid */}
        <div className="relative z-10 flex flex-col space-y-4 sm:space-y-5">
          {/* Top Bar: Live Pill & Video Link */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2 sm:space-x-2.5 flex-wrap gap-y-1">
              {/* Glass Media Capsule Pill */}
              <div
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-2xs backdrop-blur-md ${
                  isDark
                    ? 'bg-white/10 text-neutral-200 border border-white/15'
                    : 'bg-white/80 text-neutral-800 border border-white shadow-[0_2px_8px_rgba(0,0,0,0.03)]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>🎬 {featuredKit.badgeText || 'Curated Review Kit'}</span>
              </div>

              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                • {itemCount} Reviewed Items
              </span>
            </div>

            {/* Watch Reel Link (If provided) */}
            {featuredKit.videoUrl && (
              <a
                href={featuredKit.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors px-2.5 py-1 rounded-full bg-white/40 dark:bg-white/10 border border-white/60 dark:border-white/10 backdrop-blur-sm shadow-2xs cursor-pointer"
              >
                <Play size={11} className="fill-current text-indigo-600 dark:text-indigo-400" />
                <span>Watch Video</span>
              </a>
            )}
          </div>

          {/* Title & Description Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div className="max-w-2xl">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-tight font-sans text-neutral-900 dark:text-white">
                {featuredKit.title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                {featuredKit.subtitle ||
                  featuredKit.description ||
                  'All items reviewed together in our latest video with verified affiliate buy links.'}
              </p>
            </div>

            {/* Desktop Action CTA (Quick 1-Click Launch) */}
            <div className="shrink-0 hidden md:block">
              <button
                onClick={() => openKitModal(featuredKit)}
                className="px-5 py-2.5 rounded-2xl bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs sm:text-sm font-bold shadow-[0_6px_20px_rgba(0,0,0,0.18)] active:scale-95 transition-all flex items-center space-x-2 cursor-pointer ring-1 ring-white/20 whitespace-nowrap"
              >
                <span>⚡ View All {itemCount} Items</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* 
            INTERACTIVE FROSTED GLASS PRODUCT TRAY
            Shows real items floating in glass chips rather than compressed circles!
          */}
          <div className="pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {displayProducts.map((product, idx) => {
                const price = Number(
                  product.priceValue || product.displayPrice?.replace(/[^0-9]/g, '') || 0
                ).toLocaleString('en-IN');

                return (
                  <div
                    key={product.id || idx}
                    onClick={() => openKitModal(featuredKit)}
                    className={`group/card relative flex items-center space-x-2.5 sm:space-x-3 p-2 sm:p-2.5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                      isDark
                        ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20'
                        : 'bg-white/70 hover:bg-white/95 border-white/90 shadow-[0_3px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]'
                    }`}
                  >
                    {/* Item Number Pill */}
                    <span className="absolute -top-1.5 -left-1.5 z-10 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-neutral-900 text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-neutral-900 shadow-2xs">
                      {idx + 1}
                    </span>

                    {/* Crisp White Photo Canvas */}
                    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-neutral-100 shadow-2xs overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover/card:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80';
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block truncate">
                        {product.categoryLabel || 'Featured'}
                      </span>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate leading-snug">
                        {product.name}
                      </h4>
                      <span className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200 block mt-0.5">
                        ₹{price}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Bottom Action Button (< md) */}
          <div className="md:hidden pt-1">
            <button
              onClick={() => openKitModal(featuredKit)}
              className="w-full py-2.5 rounded-2xl bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer ring-1 ring-white/20"
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
