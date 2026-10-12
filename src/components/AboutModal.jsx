import React from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div
          className="relative bg-white rounded-3xl max-w-lg w-full text-left shadow-2xl p-6 sm:p-8 border border-neutral-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-neutral-900 mb-2">
            About The Journal
          </h3>
          <p className="text-xs uppercase tracking-widest text-[#E87A90] font-semibold mb-4">
            TechnicalSky
          </p>

          <div className="space-y-3.5 text-xs sm:text-sm text-neutral-600 leading-relaxed">
            <p>
              We curate singular, beautifully engineered tools across computing, audio, tactile workspace accessories, and living environments.
            </p>
            <p>
              Rather than overwhelming you with endless algorithmic listings, every artifact in this collection is carefully evaluated for industrial design integrity, tactile quality, and lasting daily utility.
            </p>
            <div className="pt-2 border-t border-neutral-100 space-y-2">
              <div className="flex items-center space-x-2 text-neutral-800 font-medium text-xs">
                <CheckCircle2 size={14} className="text-[#E87A90]" />
                <span>Verified authentic affiliate destinations (Amazon & Flipkart)</span>
              </div>
              <div className="flex items-center space-x-2 text-neutral-800 font-medium text-xs">
                <CheckCircle2 size={14} className="text-[#E87A90]" />
                <span>Zero sponsored placement bias or inflated ratings</span>
              </div>
              <div className="flex items-center space-x-2 text-neutral-800 font-medium text-xs">
                <CheckCircle2 size={14} className="text-[#E87A90]" />
                <span>Seamless bag selection with instant affiliate checkout</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-medium text-white bg-neutral-900 hover:bg-black transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

