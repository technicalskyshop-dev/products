import React from 'react';
import { Play, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { resolveTheme } from '../data/themes';

export default function ReviewKitsBanner() {
  const { reviewKits, openKitModal, products, settings } = useStore();
  const theme = resolveTheme(settings);
  const isDark = Boolean(theme.isDark);

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
    <div className="w-full mb-6 sm:mb-8 animate-fade-in-up">
      {/* 
        High-Contrast Luxury Frosted Glass Showcase Capsule
        Designed with crystal-clear readability on light & dark backgrounds
      */}
      <div
        className={`relative w-full rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 md:p-7 transition-all duration-300 select-none overflow-hidden ${
          isDark
            ? 'bg-neutral-900/80 border border-white/20 text-white shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] ring-1 ring-white/10'
            : 'bg-white/75 border border-white text-neutral-950 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06),inset_0_1.5px_2px_rgba(255,255,255,1)]'
        }`}
        style={{
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        }}
      >
        {/* Specular Top Glass Rim Highlight */}
        <div
          className={`absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${
            isDark ? 'from-white/15' : 'from-white/90 via-white/30'
          } to-transparent pointer-events-none rounded-t-[24px] sm:rounded-t-[32px]`}
        />

        {/* Ambient Subtle Color Sheen behind the glass */}
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-gradient-to-tr from-cyan-400/8 via-indigo-400/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Inner Content */}
        <div className="relative z-10 flex flex-col space-y-4 sm:space-y-5">
          {/* Top Bar: Live Badge & Watch Video Link */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap gap-y-1">
              {/* Solid High-Contrast Media Badge */}
              <div
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-xs ${
                  isDark
                    ? 'bg-white text-neutral-950 ring-1 ring-white/20'
                    : 'bg-neutral-950 text-white shadow-sm'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>🎬 {featuredKit.badgeText || 'Curated Review Kit'}</span>
              </div>

              <span
                className={`text-xs font-bold tracking-tight ${
                  isDark ? 'text-neutral-300' : 'text-neutral-600'
                }`}
              >
                • {itemCount} Reviewed Items in 1-Click Bundle
              </span>
            </div>

            {/* Watch Reel Link (If provided) */}
            {featuredKit.videoUrl && (
              <a
                href={featuredKit.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1 rounded-full transition-all cursor-pointer shadow-xs ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200/80'
                }`}
              >
                <Play size={11} className="fill-current text-indigo-500" />
                <span>Watch Reel</span>
              </a>
            )}
          </div>

          {/* Title, Subtitle, and Primary Launch Button */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2
                className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight font-sans ${
                  isDark ? 'text-white' : 'text-neutral-950'
                }`}
              >
                {featuredKit.title}
              </h2>
              <p
                className={`text-xs sm:text-sm font-medium mt-1 leading-relaxed ${
                  isDark ? 'text-neutral-300' : 'text-neutral-600'
                }`}
              >
                {featuredKit.subtitle ||
                  featuredKit.description ||
                  'Everything reviewed in this video, bundled together with direct verified buy links.'}
              </p>
            </div>

            {/* Desktop Primary Button */}
            <div className="shrink-0 hidden md:block">
              <button
                onClick={() => openKitModal(featuredKit)}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center space-x-2 cursor-pointer ${
                  isDark
                    ? 'bg-white hover:bg-neutral-100 text-neutral-950 ring-2 ring-white/30'
                    : 'bg-neutral-950 hover:bg-black text-white ring-1 ring-black/10'
                }`}
              >
                <span>⚡ View All {itemCount} Items</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* 
            HIGH-CONTRAST FROSTED PRODUCT TRAY
            Real floating cards with crystal-clear text & prices
          */}
          <div className="pt-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
              {displayProducts.map((product, idx) => {
                const price = Number(
                  product.priceValue || product.displayPrice?.replace(/[^0-9]/g, '') || 0
                ).toLocaleString('en-IN');

                return (
                  <div
                    key={product.id || idx}
                    onClick={() => openKitModal(featuredKit)}
                    className={`group/card relative flex items-center space-x-2.5 sm:space-x-3 p-2.5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 cursor-pointer ${
                      isDark
                        ? 'bg-neutral-800/80 hover:bg-neutral-800 border-white/15 hover:border-white/30 shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
                        : 'bg-white hover:bg-white border-neutral-200/90 hover:border-neutral-400 shadow-[0_3px_12px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.09)]'
                    }`}
                  >
                    {/* Item Number Tag */}
                    <span
                      className={`absolute -top-1.5 -left-1.5 z-10 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shadow-xs ${
                        isDark
                          ? 'bg-white text-neutral-950 ring-2 ring-neutral-900'
                          : 'bg-neutral-950 text-white ring-2 ring-white'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    {/* Crisp White Photo Canvas */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-neutral-200/70 shadow-2xs overflow-hidden">
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

                    {/* Details: High Contrast Crisp Typography */}
                    <div className="min-w-0 flex-1">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-indigo-600 block truncate">
                        {product.categoryLabel || 'Gear'}
                      </span>
                      <h4
                        className={`text-xs font-bold truncate leading-tight mt-0.5 ${
                          isDark ? 'text-white' : 'text-neutral-950'
                        }`}
                        title={product.name}
                      >
                        {product.name}
                      </h4>
                      <span
                        className={`text-xs font-black block mt-0.5 ${
                          isDark ? 'text-emerald-400' : 'text-neutral-950'
                        }`}
                      >
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
              className={`w-full py-3 rounded-2xl text-xs font-extrabold shadow-md active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                isDark
                  ? 'bg-white text-neutral-950'
                  : 'bg-neutral-950 text-white'
              }`}
            >
              <span>⚡ View All {itemCount} Items</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
