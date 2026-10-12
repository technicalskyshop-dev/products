import React from 'react';
import { X, ExternalLink } from 'lucide-react';

export default function ProductModal({
  product,
  isOpen,
  onClose,
}) {
  const [modalImageError, setModalImageError] = React.useState(false);

  // Reset image error state whenever a different product is selected
  React.useEffect(() => {
    setModalImageError(false);
  }, [product?.id]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm animate-fade-soft"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 text-center">
        <div
          className="relative bg-white rounded-3xl max-w-2xl w-full text-left shadow-2xl overflow-hidden p-6 sm:p-8 border border-neutral-100 animate-modal-scale"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors z-10"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-center">
            {/* Pale Product Image Container */}
            <div className="w-full h-64 sm:h-80 bg-[#F5F2F9] rounded-2xl p-6 flex items-center justify-center relative">
              {!modalImageError && product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  onError={() => setModalImageError(true)}
                  className="w-full h-full object-contain filter contrast-[1.02]"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 p-4 text-center">
                  <span className="text-4xl mb-2">✦</span>
                  <span className="text-xs font-medium tracking-tight text-neutral-500">
                    {product.name}
                  </span>
                  <span className="text-[11px] text-neutral-400 mt-1">Image specimen unavailable</span>
                </div>
              )}
            </div>

            {/* Info and Destination Links */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                  {product.categoryLabel}
                </span>

                <h3 className="text-xl sm:text-2xl font-serif text-neutral-900 tracking-tight mt-1 mb-2 font-normal">
                  {product.name}
                </h3>

                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-lg font-semibold text-neutral-900">
                    {product.displayPrice}
                  </span>
                  {product.originalPrice && product.originalPrice !== product.displayPrice && (
                    <span className="text-xs line-through text-neutral-400">
                      {product.originalPrice}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                  {product.description}
                </p>
              </div>

              {/* Direct Affiliate Redirect Buttons (Tracked through server redirect gateway) */}
              <div className="space-y-2.5 pt-2">
                {product.amazonUrl && (
                  <a
                    href={`/api/go/${product.id}/amazon`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center space-x-2 bg-neutral-900 text-white hover:bg-black transition-colors shadow-sm group"
                  >
                    <span>Buy on Amazon India</span>
                    <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}

                {product.flipkartUrl && (
                  <a
                    href={`/api/go/${product.id}/flipkart`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center space-x-2 bg-[#F6F4FA] border border-neutral-300/80 text-neutral-900 hover:bg-neutral-200/50 transition-colors group"
                  >
                    <span>Buy on Flipkart</span>
                    <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}

                <p className="text-[11px] text-neutral-400 text-center pt-1 flex items-center justify-center space-x-1">
                  <span>Direct merchant redirection · No extra cost to you</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

