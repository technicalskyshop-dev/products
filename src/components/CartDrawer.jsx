import React from 'react';
import { X, ExternalLink, Trash2, ShoppingBag } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  selectedProducts,
  onRemoveProduct,
  onClearCart,
}) {
  if (!isOpen) return null;

  const totalAmount = selectedProducts.reduce(
    (sum, item) => sum + (item.priceValue || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF9FC] shadow-2xl flex flex-col justify-between border-l border-neutral-200">
          {/* Header */}
          <div className="p-6 border-b border-neutral-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
                Selected Bag
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-900 text-white font-medium">
                {selectedProducts.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-200/60 text-neutral-500 hover:text-neutral-900 transition-colors"
              aria-label="Close cart drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {selectedProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 text-neutral-500">
                <ShoppingBag size={36} strokeWidth={1.5} className="mb-3 text-neutral-400" />
                <p className="text-sm font-medium text-neutral-700">Your selection is empty</p>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                  Click the plus icon on any product to save it to your curated bag.
                </p>
              </div>
            ) : (
              selectedProducts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-3.5 rounded-xl border border-neutral-200/70 shadow-sm flex space-x-3.5 items-start group"
                >
                  {/* Pale Image Thumbnail */}
                  <div className="w-16 h-16 shrink-0 bg-[#F5F2F9] rounded-lg p-2 flex items-center justify-center overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs sm:text-sm font-medium text-neutral-900 truncate pr-2">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => onRemoveProduct(item.id)}
                        className="text-neutral-400 hover:text-red-500 transition-colors p-0.5"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <p className="text-xs font-semibold text-neutral-800 mt-0.5">
                      {item.displayPrice}
                    </p>

                    {/* Affiliate Links for Amazon & Flipkart */}
                    <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-neutral-100">
                      {item.amazonUrl && (
                        <a
                          href={`/api/go/${item.id}/amazon`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-neutral-900 text-white hover:bg-black transition-colors"
                        >
                          <span>Amazon</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                      {item.flipkartUrl && (
                        <a
                          href={`/api/go/${item.id}/flipkart`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#2874F0] text-white hover:bg-blue-600 transition-colors"
                        >
                          <span>Flipkart</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Summary & Actions */}
          {selectedProducts.length > 0 && (
            <div className="p-6 bg-white border-t border-neutral-200/80 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500">Estimated Total</span>
                <span className="text-base font-semibold text-neutral-900">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <p className="text-[11px] text-neutral-400 leading-normal">
                Purchases proceed directly via verified merchant partner links on Amazon and Flipkart.
              </p>

              <div className="flex space-x-2 pt-1">
                <button
                  onClick={onClearCart}
                  className="w-1/3 py-2 px-3 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={onClose}
                  className="w-2/3 py-2 px-3 text-xs font-medium text-white bg-neutral-900 hover:bg-black rounded-lg transition-colors text-center"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

