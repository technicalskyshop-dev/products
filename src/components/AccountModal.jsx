import React from 'react';
import { X, User, Heart, Settings, Shield, ExternalLink } from 'lucide-react';

export default function AccountModal({ isOpen, onClose, selectedCount }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div
          className="relative bg-white rounded-3xl max-w-md w-full text-left shadow-2xl p-6 sm:p-8 border border-neutral-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {/* User Profile Header */}
          <div className="flex items-center space-x-3.5 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#EDE8F5] flex items-center justify-center text-neutral-800 font-medium">
              <User size={22} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900">
                Collector Profile
              </h3>
              <p className="text-xs text-neutral-400">Curator Member #4092</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="bg-[#FAF9FC] p-3 rounded-xl border border-neutral-200/60 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Heart size={16} className="text-[#E87A90]" />
                <span className="text-xs font-medium text-neutral-800">
                  Curated Bag Items
                </span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-900 text-white">
                {selectedCount}
              </span>
            </div>

            <div className="bg-[#FAF9FC] p-3 rounded-xl border border-neutral-200/60 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Shield size={16} className="text-neutral-600" />
                <span className="text-xs font-medium text-neutral-800">
                  Affiliate Link Safety
                </span>
              </div>
              <span className="text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded-md font-medium">
                Verified Direct
              </span>
            </div>

            <div className="bg-[#FAF9FC] p-3 rounded-xl border border-neutral-200/60 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Settings size={16} className="text-neutral-600" />
                <span className="text-xs font-medium text-neutral-800">
                  Primary Destination
                </span>
              </div>
              <span className="text-xs text-neutral-500 font-medium">
                Amazon India & Flipkart
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-medium text-white bg-neutral-900 hover:bg-black transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

