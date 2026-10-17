import React, { useState, useMemo } from 'react';
import {
  Film,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  Play,
  Layers,
  ArrowRight,
  X,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ReviewKitManagement({ showToast, onOpenStorefront }) {
  const { reviewKits, addReviewKit, updateReviewKit, deleteReviewKit, products, openKitModal } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKitId, setEditingKitId] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [badgeText, setBadgeText] = useState('Reel / Review #01');
  const [isFeatured, setIsFeatured] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://technicalskystuff.com';

  const handleOpenCreateModal = () => {
    setEditingKitId(null);
    setTitle('');
    setSlug('');
    setSubtitle('');
    setDescription('');
    setVideoUrl('');
    setBadgeText('Reel / Review #0' + ((reviewKits?.length || 0) + 1));
    setIsFeatured(true);
    // Auto-select first 4-5 published products as helpful default
    const defaultIds = products.filter((p) => p.status === 'published').slice(0, 5).map((p) => p.id);
    setSelectedProductIds(defaultIds);
    setProductSearch('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (kit) => {
    setEditingKitId(kit.id);
    setTitle(kit.title || '');
    setSlug(kit.slug || '');
    setSubtitle(kit.subtitle || '');
    setDescription(kit.description || '');
    setVideoUrl(kit.videoUrl || '');
    setBadgeText(kit.badgeText || 'Reel / Review');
    setIsFeatured(kit.isFeatured !== false);
    setSelectedProductIds(Array.isArray(kit.productIds) ? kit.productIds : []);
    setProductSearch('');
    setIsModalOpen(true);
  };

  const handleTitleChange = (val) => {
    setTitle(val);
    if (!editingKitId) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug);
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const handleCopyLink = (kitSlug) => {
    const url = `${currentOrigin}?kit=${kitSlug}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedSlug(kitSlug);
      showToast?.({
        title: 'Reel Link Copied!',
        message: `Shareable URL copied: ${url.replace(/^https?:\/\//, '')}`,
        type: 'success',
      });
      setTimeout(() => setCopiedSlug(null), 2500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast?.({
        title: 'Title Required',
        message: 'Please provide a title for this review kit.',
        type: 'error',
      });
      return;
    }

    if (selectedProductIds.length === 0) {
      showToast?.({
        title: 'Select Products',
        message: 'Please select at least 1 product (recommended: 4 to 5 products).',
        type: 'error',
      });
      return;
    }

    setIsSaving(true);
    const payload = {
      title: title.trim(),
      slug: slug.trim() || `kit-${Date.now()}`,
      subtitle: subtitle.trim() || undefined,
      description: description.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      badgeText: badgeText.trim() || 'Reel / Review',
      isFeatured,
      productIds: selectedProductIds,
    };

    if (editingKitId) {
      await updateReviewKit(editingKitId, payload);
      showToast?.({
        title: 'Kit Updated!',
        message: `"${payload.title}" has been updated successfully.`,
        type: 'success',
      });
    } else {
      await addReviewKit(payload);
      showToast?.({
        title: 'Review Kit Created!',
        message: `"${payload.title}" is now live and shareable.`,
        type: 'success',
      });
    }

    setIsSaving(false);
    setIsModalOpen(false);
  };

  const handleDelete = async (kit) => {
    if (window.confirm(`Are you sure you want to delete "${kit.title}"?`)) {
      await deleteReviewKit(kit.id);
      showToast?.({
        title: 'Kit Deleted',
        message: `"${kit.title}" was removed.`,
        type: 'success',
      });
    }
  };

  // Filter products for the picker modal
  const filteredProducts = useMemo(() => {
    const term = productSearch.toLowerCase().trim();
    if (!term) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.categoryLabel?.toLowerCase().includes(term) ||
        p.slug?.toLowerCase().includes(term)
    );
  }, [products, productSearch]);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 font-bold">
              <Film size={20} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Video & Reel Bundles
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 mt-2">
            Review Kits / 1-Click Bundles
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl mt-0.5">
            Group 4–5 reviewed items into a single kit. When viewers click your Instagram bio or YouTube link, all items open instantly with direct Amazon & Flipkart buy buttons!
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 sm:px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>New Review Kit</span>
        </button>
      </div>

      {/* Info Cards / How It Works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-neutral-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Step 1</span>
          <h4 className="text-sm font-bold text-neutral-900 mt-1">Review 4–5 Gadgets</h4>
          <p className="text-xs text-neutral-500 mt-0.5">
            Record your video or Reel talking about 4-5 awesome products from your store.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/60 shadow-xs">
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">Step 2</span>
          <h4 className="text-sm font-bold text-indigo-950 mt-1">Put 1 Link in Bio</h4>
          <p className="text-xs text-indigo-700 mt-0.5">
            Copy the 1-click link (e.g. <code>technicalskystuff.com?kit=desk-setup</code>) into your video caption or bio.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Step 3</span>
          <h4 className="text-sm font-bold text-emerald-950 mt-1">Instant Viewer Conversion</h4>
          <p className="text-xs text-emerald-700 mt-0.5">
            Viewer clicks once and sees all 5 products with photos, prices, and direct buy buttons!
          </p>
        </div>
      </div>

      {/* Kits List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wider px-1">
          Active Review Kits ({reviewKits.length})
        </h3>

        {reviewKits.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200/80">
            <Film size={36} className="mx-auto text-neutral-300 mb-3" />
            <h4 className="text-base font-bold text-neutral-800">No review kits created yet</h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Create your first review kit so you can share multiple products with a single link in your next video!
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-4 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold cursor-pointer"
            >
              Create First Kit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {reviewKits.map((kit) => {
              const pIds = Array.isArray(kit.productIds) ? kit.productIds : [];
              const kitProducts = pIds
                .map((id) => products.find((p) => p.id === id || p.slug === id))
                .filter(Boolean);
              const previewProducts = kitProducts.length > 0 ? kitProducts : products.slice(0, 5);
              const isCopied = copiedSlug === kit.slug;

              return (
                <div
                  key={kit.id}
                  className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                        <Film size={18} />
                        <span className="text-[9px] font-bold text-amber-400 mt-0.5">
                          {pIds.length} ITEMS
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {kit.badgeText || 'Reel Review'}
                          </span>
                          {kit.isFeatured && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              ★ Featured on Storefront
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-extrabold text-neutral-900 mt-1">
                          {kit.title}
                        </h4>

                        {kit.subtitle && (
                          <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                            {kit.subtitle}
                          </p>
                        )}

                        {/* Deep link box */}
                        <div className="mt-2.5 flex items-center space-x-2">
                          <span className="text-xs text-neutral-400 font-medium">Reel Link:</span>
                          <code className="text-xs font-mono bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200/80 text-indigo-700">
                            {currentOrigin.replace(/^https?:\/\//, '')}?kit={kit.slug}
                          </code>
                          <button
                            onClick={() => handleCopyLink(kit.slug)}
                            className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                            title="Copy link for Instagram bio"
                          >
                            {isCopied ? (
                              <>
                                <Check size={12} className="text-emerald-600" />
                                <span className="text-emerald-700 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Product Thumbs */}
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-2 overflow-hidden py-1">
                        {previewProducts.slice(0, 4).map((p, idx) => (
                          <img
                            key={p.id || idx}
                            src={p.imageUrl}
                            alt={p.name}
                            className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover bg-white shadow-xs"
                          />
                        ))}
                        {previewProducts.length > 4 && (
                          <div className="h-9 w-9 rounded-full ring-2 ring-white bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                            +{previewProducts.length - 4}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => openKitModal(kit)}
                        className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-50 text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                        title="Preview 1-click modal"
                      >
                        <Eye size={14} />
                        <span className="hidden sm:inline">Preview</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(kit)}
                        className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-50 text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                        title="Edit kit"
                      >
                        <Edit2 size={14} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(kit)}
                        className="p-2 rounded-xl border border-neutral-200 text-red-500 hover:text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                        title="Delete kit"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT KIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Film size={20} />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                    {editingKitId ? 'Edit Review Kit' : 'Create New Review Kit'}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Group 4–5 products into a 1-click reel bundle.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scroll">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Kit Title (Video / Reel Topic) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ultimate Clean Desk Setup 2026"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Slug / Link ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. desk-setup"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
                  />
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    Link: <code>?kit={slug || 'slug'}</code>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Badge Text (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. YouTube Reel #04"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Video / Reel URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/reel/... or YouTube URL"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Subtitle / Video Summary (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. All 5 gadgets reviewed in Reel #04 with verified affiliate buy links"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                />
                <label htmlFor="isFeatured" className="text-xs font-bold text-neutral-800 cursor-pointer">
                  Feature this Kit prominently on the storefront
                </label>
              </div>

              {/* PRODUCT SELECTION SECTION */}
              <div className="pt-3 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="text-xs font-bold text-neutral-800">
                      Select Products to Include in this Kit
                    </label>
                    <p className="text-[11px] text-neutral-400">
                      Tick 4 to 5 products reviewed in the video.
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      selectedProductIds.length >= 4 && selectedProductIds.length <= 6
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {selectedProductIds.length} Selected
                  </span>
                </div>

                {/* Product Search */}
                <div className="relative mb-2.5">
                  <Search size={14} className="absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search products by name or category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 text-xs bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                {/* Products Checklist */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto border border-neutral-200 rounded-2xl p-2 bg-neutral-50/60 custom-scroll">
                  {filteredProducts.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleProductSelection(p.id)}
                        className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white shadow-xs border border-neutral-300'
                            : 'hover:bg-neutral-100/80 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          {isSelected ? (
                            <CheckSquare size={16} className="text-indigo-600 shrink-0" />
                          ) : (
                            <Square size={16} className="text-neutral-400 shrink-0" />
                          )}
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-8 h-8 rounded-lg object-contain bg-white border border-neutral-200 shrink-0 p-0.5"
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-neutral-900 truncate">
                              {p.name}
                            </h5>
                            <span className="text-[10px] text-neutral-400">
                              {p.categoryLabel || 'Item'} • ₹{Number(p.priceValue || p.displayPrice?.replace(/[^0-9]/g, '') || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[10px] font-bold text-indigo-600 px-2 py-0.5 rounded-full bg-indigo-50 shrink-0">
                            Included
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  {isSaving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <span>{editingKitId ? 'Save Changes' : 'Publish Review Kit'}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
