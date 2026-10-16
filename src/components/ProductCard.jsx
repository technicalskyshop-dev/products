import React, { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import StoreChooserModal from './StoreChooserModal';

export default function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false);
  const [isChooserOpen, setIsChooserOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const hasAmazon = Boolean(product.amazonUrl && product.amazonUrl.trim());
  const hasFlipkart = Boolean(product.flipkartUrl && product.flipkartUrl.trim());

  // Calculate discount percentage if originalPrice is higher
  const calculateDiscount = () => {
    if (!product.originalPrice || !product.displayPrice) return null;
    const orig = Number(String(product.originalPrice).replace(/[^0-9]/g, ''));
    const curr = Number(String(product.displayPrice).replace(/[^0-9]/g, ''));
    if (orig && curr && orig > curr) {
      return Math.round(((orig - curr) / orig) * 100);
    }
    return null;
  };
  const discount = calculateDiscount();

  const handleCardClick = (e) => {
    e?.stopPropagation?.();

    if (hasAmazon && !hasFlipkart) {
      window.open(`/api/go/${product.id}/amazon`, '_blank', 'noopener,noreferrer');
    } else if (!hasAmazon && hasFlipkart) {
      window.open(`/api/go/${product.id}/flipkart`, '_blank', 'noopener,noreferrer');
    } else if (hasAmazon && hasFlipkart) {
      setIsChooserOpen(true);
    }
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <>
      {/* 
        Sillycorns-Inspired Luxury Frosted Glass Product Card
        - Outer Capsule: Dark frosted glass shell (#222224 with backdrop-blur & subtle glass border)
        - Inner Window: Pure crisp white photo canvas (#FFFFFF with smooth rounded corners)
        - Bottom Bar: Clean typography with product name, price, and floating arrow
        - Adapts seamlessly: 3 columns on mobile, 4 columns on desktop!
      */}
      <div
        className="group relative flex flex-col w-full text-center select-none bg-white/75 hover:bg-white/95 backdrop-blur-xl rounded-[18px] sm:rounded-[24px] p-1.5 sm:p-2.5 md:p-3 border border-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Subtle Specular Top Glass Highlight */}
        <div className="absolute inset-x-0 top-0 h-10 rounded-t-[18px] sm:rounded-t-[24px] bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />

        {/* Inner Crisp White Product Image Tile */}
        <div className="relative w-full aspect-square bg-white rounded-[14px] sm:rounded-[18px] overflow-hidden flex items-center justify-center p-2.5 sm:p-4 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-neutral-100">
          {/* Top-Left Floating Badge (Discount / Curator Pick) */}
          {discount ? (
            <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 px-1.5 sm:px-2 py-0.5 rounded-full bg-neutral-900 text-white font-bold text-[8.5px] sm:text-[10px] tracking-tight shadow-xs">
              −{discount}%
            </span>
          ) : product.isFeatured ? (
            <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 px-1.5 sm:px-2 py-0.5 rounded-full bg-neutral-900 text-white font-bold text-[8.5px] sm:text-[10px] tracking-tight flex items-center space-x-1 shadow-xs">
              <Sparkles size={10} className="text-amber-400 fill-amber-400" />
              <span>Pick</span>
            </span>
          ) : null}

          {/* Top-Right Heart / Favorite Toggle Button */}
          <button
            type="button"
            onClick={handleLikeClick}
            aria-label="Add to favorites"
            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-neutral-100/80 hover:bg-white backdrop-blur-sm flex items-center justify-center transition-transform active:scale-90 hover:scale-105 cursor-pointer shadow-xs"
          >
            <Heart
              size={12}
              className={`transition-colors ${
                isLiked ? 'text-rose-500 fill-rose-500' : 'text-neutral-400 hover:text-neutral-700'
              }`}
            />
          </button>

          {/* Product Photography with floating drop-shadow */}
          {!imageError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-contain filter contrast-[1.02] drop-shadow-[0_6px_14px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-300 text-center">
              <span className="text-xl mb-1">✦</span>
              <span className="text-[10px] text-neutral-400 font-medium line-clamp-1 px-1">
                {product.name}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Title & Price Strip (Frosted Glass with Clear Dark Typography) */}
        <div className="pt-2.5 sm:pt-3 pb-1 px-1 sm:px-1.5 flex flex-col items-center justify-center text-center">
          {/* Product Name - Crisp Dark Typography */}
          <h3
            className="text-[12px] sm:text-[13.5px] md:text-[14px] font-bold text-neutral-900 tracking-tight line-clamp-2 leading-snug group-hover:text-black transition-colors w-full"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Price & Strikethrough - Bold Dark Contrast */}
          {product.displayPrice && (
            <div className="flex items-center justify-center space-x-1.5 mt-1">
              <span className="text-[11.5px] sm:text-[13px] md:text-[13.5px] font-extrabold text-neutral-900 tracking-tight">
                {product.displayPrice}
              </span>
              {product.originalPrice && product.originalPrice !== product.displayPrice && (
                <span className="text-[9.5px] sm:text-[11px] text-neutral-400 line-through font-normal hidden sm:inline">
                  {product.originalPrice}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STORE CHOOSER MODAL (Rendered via createPortal ONLY when BOTH stores set) */}
      {/* ========================================================================= */}
      {isChooserOpen && (
        <StoreChooserModal
          product={product}
          onClose={() => setIsChooserOpen(false)}
        />
      )}
    </>
  );
}
