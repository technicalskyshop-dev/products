import React, { useState } from 'react';
import {
  Settings,
  Download,
  RotateCcw,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Tag,
} from 'lucide-react';

export default function SettingsView({
  settings,
  onUpdateSettings,
  onResetToDefaults,
  onExportCatalog,
  showToast,
}) {
  const [formData, setFormData] = useState({
    storeName: settings.storeName || 'TechnicalSky',
    brandWordmark: settings.brandWordmark || 'TECHNICALSKY',
    currencySymbol: settings.currencySymbol || '₹',
    defaultAmazonTag: settings.defaultAmazonTag || 'technicalsky-21',
    defaultFlipkartTag: settings.defaultFlipkartTag || 'technicalsky',
    inquiryEmail: settings.inquiryEmail || 'contact@technicalsky.com',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Sync form data when remote settings load or update
  React.useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || 'TechnicalSky',
        brandWordmark: settings.brandWordmark || 'TECHNICALSKY',
        currencySymbol: settings.currencySymbol || '₹',
        defaultAmazonTag: settings.defaultAmazonTag || 'technicalsky-21',
        defaultFlipkartTag: settings.defaultFlipkartTag || 'technicalsky',
        inquiryEmail: settings.inquiryEmail || 'contact@technicalsky.com',
      });
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await onUpdateSettings(formData);
      if (res?.success) {
        showToast({
          title: 'Settings Saved & Verified',
          message: 'Both Amazon and Flipkart affiliate tags are updated on live redirect engine.',
        });
      } else {
        showToast({
          title: 'Save Note',
          message: res?.error || 'Updated in local store session.',
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmReset = () => {
    onResetToDefaults();
    setIsResetConfirmOpen(false);
    showToast({
      title: 'Storefront Reset',
      message: 'All products and categories have been restored to initial fixtures.',
    });
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="pb-2 border-b border-neutral-200/80">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          Storefront Settings
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Configure brand metadata, affiliate tracking tags, and outgoing redirect links.
        </p>
      </div>

      {/* Active Affiliate Gateway Status Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 flex items-start space-x-3.5 shadow-xs">
        <CheckCircle2 size={20} className="shrink-0 text-emerald-600 mt-0.5" />
        <div className="text-xs space-y-1.5 flex-1">
          <div className="flex items-center justify-between">
            <strong className="font-bold uppercase tracking-wider text-[11px] block text-emerald-900">
              Live Affiliate Tracking Engine Active
            </strong>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              <span>Dynamic Tag Injection</span>
            </span>
          </div>
          <p className="text-emerald-800/90 leading-relaxed text-[11.5px]">
            Every click to Amazon or Flipkart redirects through secure gateway endpoints{' '}
            <code className="bg-emerald-100/90 px-1 py-0.5 rounded text-[10.5px] font-mono text-emerald-900">
              /api/go/:id/amazon
            </code>{' '}
            and{' '}
            <code className="bg-emerald-100/90 px-1 py-0.5 rounded text-[10.5px] font-mono text-emerald-900">
              /api/go/:id/flipkart
            </code>
            . The active tags configured below are automatically embedded into every destination URL.
          </p>
        </div>
      </div>

      {/* General Settings Form */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm space-y-6">
        <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Brand Identity & Affiliates</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Customize headers, affiliate tags, and display parameters
            </p>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-neutral-900 hover:bg-black transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Save size={14} />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Storefront Display Name
            </label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Header Wordmark Text
            </label>
            <input
              type="text"
              value={formData.brandWordmark}
              onChange={(e) => setFormData({ ...formData, brandWordmark: e.target.value })}
              placeholder="e.g. TECHNICALSKY"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 uppercase tracking-widest font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Currency Symbol
            </label>
            <input
              type="text"
              value={formData.currencySymbol}
              onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Curator Contact Email
            </label>
            <input
              type="email"
              value={formData.inquiryEmail}
              onChange={(e) => setFormData({ ...formData, inquiryEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-neutral-900">
                Default Amazon Associate Tag
              </label>
              <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 font-semibold">
                ?tag={formData.defaultAmazonTag || 'none'}
              </span>
            </div>
            <input
              type="text"
              value={formData.defaultAmazonTag}
              onChange={(e) => setFormData({ ...formData, defaultAmazonTag: e.target.value })}
              placeholder="e.g. technicalsky-21"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
            />
            <p className="text-[10.5px] text-neutral-500 leading-tight">
              India Amazon Associate Store ID. Automatically appends <code className="font-mono text-neutral-800">?tag=...</code> to all product Amazon links.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-neutral-900">
                Default Flipkart Affiliate Tag
              </label>
              <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 font-semibold">
                ?affid={formData.defaultFlipkartTag || 'none'}
              </span>
            </div>
            <input
              type="text"
              value={formData.defaultFlipkartTag}
              onChange={(e) => setFormData({ ...formData, defaultFlipkartTag: e.target.value })}
              placeholder="e.g. technicalsky"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
            />
            <p className="text-[10.5px] text-neutral-500 leading-tight">
              Flipkart Affiliate Account ID. Automatically appends <code className="font-mono text-neutral-800">?affid=...</code> to all product Flipkart links.
            </p>
          </div>
        </div>
      </form>

      {/* Catalog Backup & Export */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
        <div className="border-b border-neutral-100 pb-3">
          <h3 className="text-sm font-bold text-neutral-900">Catalog Data Tools</h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Export JSON backup or reset local database state
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Export JSON */}
          <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center space-x-2 text-neutral-900 font-semibold text-xs">
                <FileCode size={16} />
                <span>Export Catalog JSON</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                Download a complete standalone JSON backup of all products, categories, and settings.
              </p>
            </div>
            <button
              onClick={onExportCatalog}
              className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-800 bg-white border border-neutral-200 hover:bg-neutral-50 transition-colors shadow-sm self-start"
            >
              <Download size={13} />
              <span>Download .json file</span>
            </button>
          </div>

          {/* Reset to Seed Fixtures */}
          <div className="p-4 rounded-xl border border-rose-200/60 bg-rose-50/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center space-x-2 text-rose-900 font-semibold text-xs">
                <RotateCcw size={16} />
                <span>Reset to Seed Data</span>
              </div>
              <p className="text-[11px] text-rose-700/80 mt-1 leading-relaxed">
                Restore the catalog to initial Phase 1 mock specimens and default categories.
              </p>
            </div>
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-white border border-rose-300 hover:bg-rose-50 transition-colors shadow-sm self-start"
            >
              <RotateCcw size={13} />
              <span>Reset Database</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-neutral-900">Reset Entire Store Catalog?</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                This will reset all your custom products and restored categories back to the initial
                verified fixtures. This action clears browser storage and cannot be undone.
              </p>
            </div>

            <div className="pt-2 flex justify-end space-x-2.5">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

