import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  ExternalLink,
  Image as ImageIcon,
  Sparkles,
  Check,
  AlertCircle,
  Trash2,
  Loader2,
  CheckCircle2,
  ImagePlus,
  RefreshCw,
} from 'lucide-react';
import { api } from '../api/client';
import { slugify } from '../context/StoreContext';

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  product = null, // null for Add, object for Edit
  categories = [],
}) {
  const isEditing = Boolean(product);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'electronics',
    displayPrice: '',
    priceValue: '',
    originalPrice: '',
    amazonUrl: '',
    flipkartUrl: '',
    imageUrl: '',
    status: 'published',
    isFeatured: false,
    verifiedPriceSource: 'Amazon India Prime Verified',
    shortDescription: '',
    description: '',
    heightClass: 'h-72 sm:h-80 lg:h-[355px]',
    aspectRatio: 'aspect-[4/5]',
  });

  const [errors, setErrors] = useState({});
  const [localPreview, setLocalPreview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [uploadSuccessNote, setUploadSuccessNote] = useState('');
  const [activeSection, setActiveSection] = useState('section-details');

  const prevIsOpenRef = useRef(false);
  const prevProductIdRef = useRef(null);

  // Pre-fill form ONLY on initial open or switching edited product ID
  // NEVER wipe out inputs or photos while user is actively typing or uploading!
  useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    const productIdChanged = Boolean(product?.id && product.id !== prevProductIdRef.current);

    prevIsOpenRef.current = isOpen;
    prevProductIdRef.current = product?.id || null;

    if (!isOpen) return;

    if (justOpened || productIdChanged) {
      if (product) {
        setFormData({
          name: product.name || '',
          slug: product.slug || slugify(product.name),
          category: product.categoryId || product.category || 'electronics',
          displayPrice: product.displayPrice || '',
          priceValue: product.priceValue !== undefined ? String(product.priceValue) : '',
          originalPrice: product.originalPrice || '',
          amazonUrl: product.amazonUrl || '',
          flipkartUrl: product.flipkartUrl || '',
          imageUrl: product.imageUrl || '',
          status: product.status || 'published',
          isFeatured: Boolean(product.isFeatured),
          verifiedPriceSource: product.verifiedPriceSource || 'Amazon India Prime Verified',
          shortDescription: product.shortDescription || '',
          description: product.description || '',
          heightClass: product.heightClass || 'h-72 sm:h-80 lg:h-[355px]',
          aspectRatio: product.aspectRatio || 'aspect-[4/5]',
        });
        setLocalPreview(product.imageUrl || '');
        setUploadSuccessNote(product.imageUrl ? '✓ Existing product photo loaded' : '');
      } else {
        // Check for any unsaved draft so inputs/photos are never lost
        let draft = null;
        try {
          const raw = sessionStorage.getItem('curator_add_draft');
          if (raw) draft = JSON.parse(raw);
        } catch {
          // Ignore storage parse issues
        }

        if (draft && draft.formData && (draft.formData.name || draft.localPreview)) {
          setFormData(draft.formData);
          setLocalPreview(draft.localPreview || '');
          setUploadSuccessNote('✓ Unsaved draft restored');
        } else {
          // Default initial form state for a fresh new product
          setFormData({
            name: '',
            slug: '',
            category: categories.find((c) => c.id !== 'all')?.id || 'electronics',
            displayPrice: '',
            priceValue: '',
            originalPrice: '',
            amazonUrl: '',
            flipkartUrl: '',
            imageUrl: '',
            status: 'published',
            isFeatured: false,
            verifiedPriceSource: 'Amazon India Prime Verified',
            shortDescription: '',
            description: '',
            heightClass: 'h-72 sm:h-80 lg:h-[355px]',
            aspectRatio: 'aspect-[4/5]',
          });
          setLocalPreview('');
          setUploadSuccessNote('');
        }
      }
      setErrors({});
      setPreviewError(false);
      setIsUploadingImage(false);
      setActiveSection('section-details');
    }
  }, [isOpen, product?.id]);

  // Persist draft in sessionStorage while typing/uploading (Add Mode)
  useEffect(() => {
    if (!isOpen || isEditing) return;
    try {
      if (formData.name || formData.displayPrice || formData.imageUrl || localPreview) {
        sessionStorage.setItem(
          'curator_add_draft',
          JSON.stringify({ formData, localPreview })
        );
      }
    } catch {
      // Non-critical fallback
    }
  }, [isOpen, isEditing, formData, localPreview]);

  if (!isOpen) return null;

  // Auto-generate slug when name changes (only if slug was empty or matching previous name)
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: !isEditing ? slugify(newName) : prev.slug,
    }));
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: null }));
    }
  };

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Robust file upload & cloud sync handler (supports Safari, Chrome, Drag&Drop)
  const processAndUploadFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        imageUrl: 'Selected file is not an image (JPEG, PNG, WebP allowed).',
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        imageUrl: 'Image file size must be less than 10MB.',
      }));
      return;
    }

    setIsUploadingImage(true);
    setUploadSuccessNote('');
    setPreviewError(false);

    try {
      // 1. Instant 0ms local preview via FileReader
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      setLocalPreview(base64Data);
      setFormData((prev) => ({ ...prev, imageUrl: base64Data }));
      setErrors((prev) => ({ ...prev, imageUrl: null }));
      setUploadSuccessNote('✓ Photo loaded locally');

      // 2. Upload to backend (Cloudinary CDN or local static storage)
      const res = await api.uploadImage(base64Data, file.name);
      if (res?.url) {
        // Save the permanent CDN / storage URL into formData for server submission
        setFormData((prev) => ({ ...prev, imageUrl: res.url }));
        // If Cloudinary returned a full HTTPS URL, we can safely use it, otherwise keep localPreview
        if (res.storageProvider === 'cloudinary' && res.url.startsWith('http')) {
          setLocalPreview(res.url);
        }
        setUploadSuccessNote(
          res.storageProvider === 'cloudinary'
            ? '✓ Optimized on Cloudinary CDN'
            : '✓ Photo saved to media storage'
        );
      }
    } catch (err) {
      console.warn('Backend image upload notice:', err);
      // Keep the local base64 preview active so user can still submit
      setUploadSuccessNote('✓ Photo loaded locally');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processAndUploadFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processAndUploadFile(file);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          processAndUploadFile(file);
          scrollToSection('section-photo');
          return;
        }
      }
    }
  };

  // Validation function with automatic scroll-to-first-error
  const validateForm = () => {
    const errs = {};

    if (!formData.name.trim()) {
      errs.name = 'Product name is required.';
    }

    if (!formData.displayPrice.trim()) {
      errs.displayPrice = 'Display price is required (e.g. ₹14,200).';
    }

    if (!formData.imageUrl.trim() && !localPreview) {
      errs.imageUrl = 'Product image is required. Upload a photo or enter an image URL.';
    }

    const hasAmazon = Boolean(formData.amazonUrl && formData.amazonUrl.trim());
    const hasFlipkart = Boolean(formData.flipkartUrl && formData.flipkartUrl.trim());

    if (!hasAmazon && !hasFlipkart) {
      errs.amazonUrl = 'Please provide at least one store URL (Amazon or Flipkart).';
    }

    if (hasAmazon) {
      try {
        new URL(formData.amazonUrl.trim());
      } catch {
        errs.amazonUrl = 'Please enter a valid Amazon URL (including https://).';
      }
    }

    if (hasFlipkart) {
      try {
        new URL(formData.flipkartUrl.trim());
      } catch {
        errs.flipkartUrl = 'Please enter a valid Flipkart URL (including https://).';
      }
    }

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      if (errs.name) {
        scrollToSection('section-details');
      } else if (errs.displayPrice) {
        scrollToSection('section-pricing');
      } else if (errs.amazonUrl || errs.flipkartUrl) {
        scrollToSection('section-links');
      } else if (errs.imageUrl) {
        scrollToSection('section-photo');
      }
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validateForm()) return;

    // Normalize numeric price value if empty
    let priceVal = Number(formData.priceValue);
    if (!priceVal && formData.displayPrice) {
      const parsed = Number(formData.displayPrice.replace(/[^0-9]/g, ''));
      priceVal = isNaN(parsed) ? 0 : parsed;
    }

    const payload = {
      ...formData,
      priceValue: priceVal,
      slug: formData.slug.trim() || slugify(formData.name),
    };

    try {
      sessionStorage.removeItem('curator_add_draft');
    } catch {
      // Ignore storage errors
    }

    onSubmit(payload);
  };

  const activeCategories = categories.filter((c) => c.id !== 'all' && c.enabled !== false);

  const navSections = [
    { id: 'section-details', label: '1. Info', icon: '🏷️', hasError: Boolean(errors.name) },
    { id: 'section-pricing', label: '2. Pricing', icon: '💰', hasError: Boolean(errors.displayPrice) },
    { id: 'section-links', label: '3. Links', icon: '🔗', hasError: Boolean(errors.amazonUrl || errors.flipkartUrl) },
    { id: 'section-photo', label: '4. Photo', icon: '📸', hasError: Boolean(errors.imageUrl) },
    { id: 'section-publishing', label: '5. Status', icon: '⚙️', hasError: false },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-neutral-950/75 backdrop-blur-md overflow-hidden animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-none sm:rounded-3xl max-w-3xl w-full text-left shadow-2xl border-0 sm:border sm:border-neutral-200/90 flex flex-col h-full sm:h-[92vh] sm:max-h-[850px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-8 py-3.5 sm:py-4 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-neutral-50/80">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400">
              Catalog Curator
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
              {isEditing ? `Edit Product: ${product.name}` : 'Add New Product Specimen'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-neutral-200/60 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Section Navigation Bar */}
        <div className="px-4 sm:px-8 py-2 bg-neutral-100/80 border-b border-neutral-200/80 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0 select-none">
          {navSections.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => scrollToSection(sec.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                sec.hasError
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : activeSection === sec.id
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/80'
              }`}
            >
              <span>{sec.icon}</span>
              <span>{sec.label}</span>
              {sec.hasError && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />}
            </button>
          ))}
        </div>

        {/* Form Content - Smooth Scrollable container with paste listener */}
        <form
          id="product-form-body"
          onSubmit={handleSubmit}
          onPaste={handlePaste}
          className="flex-1 overflow-y-auto min-h-0 p-5 sm:p-8 space-y-7 focus:outline-none"
        >
            {/* General Info */}
            <div id="section-details" className="space-y-4 scroll-mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-1">
                1. Product Identification
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Sony WH-1000XM5 Noise-Canceling"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 ${
                      errors.name
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-neutral-200 focus:ring-neutral-900'
                    }`}
                  />
                  {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                    placeholder="e.g. sony-wh-1000xm5"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Category <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer"
                  >
                    {activeCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Verified Source Badge
                  </label>
                  <input
                    type="text"
                    value={formData.verifiedPriceSource}
                    onChange={(e) => setFormData({ ...formData, verifiedPriceSource: e.target.value })}
                    placeholder="e.g. Amazon India Prime Verified"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Short One-Line Teaser
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="e.g. Flagship dual-processor noise canceling over-ear headphones."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Editorial Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Industry-leading noise cancellation with two processors and eight microphones for unprecedented quiet..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div id="section-pricing" className="space-y-4 scroll-mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-1">
                2. Pricing & Currency
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Display Price <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.displayPrice}
                    onChange={(e) => setFormData({ ...formData, displayPrice: e.target.value })}
                    placeholder="e.g. ₹28,990"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 ${
                      errors.displayPrice
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-neutral-200 focus:ring-neutral-900'
                    }`}
                  />
                  {errors.displayPrice && (
                    <p className="text-xs text-rose-500 mt-1">{errors.displayPrice}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Numeric Value (for sorting)
                  </label>
                  <input
                    type="number"
                    value={formData.priceValue}
                    onChange={(e) => setFormData({ ...formData, priceValue: e.target.value })}
                    placeholder="28990"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Original Price (Strikethrough)
                  </label>
                  <input
                    type="text"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="e.g. ₹34,990"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>
            </div>

            {/* Affiliate Partner URLs */}
            <div id="section-links" className="space-y-4 scroll-mt-6">
              <div className="border-b border-neutral-100 pb-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  3. Store Redirection Links
                </h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Enter an Amazon link, a Flipkart link, or both.
                </p>
              </div>

              {/* Informational Guidance Box */}
              <div className="p-3.5 rounded-2xl bg-neutral-100/80 border border-neutral-200/60 text-xs space-y-1">
                <span className="font-semibold text-neutral-900 block">⚡ Live Storefront Routing Rules:</span>
                <p className="text-[11.5px] text-neutral-600 leading-relaxed">
                  • <strong>1 Link Provided:</strong> Card click directly opens that store in a new tab (1-click direct).<br />
                  • <strong>Both Links Provided:</strong> Card click opens the elegant store chooser modal for customer choice.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Amazon Product URL <span className="text-neutral-400 font-normal">(Amazon or Flipkart required)</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.amazonUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, amazonUrl: e.target.value });
                      if (errors.amazonUrl) setErrors({ ...errors, amazonUrl: null });
                    }}
                    placeholder="https://www.amazon.in/dp/B09XS7JWHH?tag=yourtag-21"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 pr-10 ${
                      errors.amazonUrl
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-neutral-200 focus:ring-neutral-900'
                    }`}
                  />
                  {formData.amazonUrl && (
                    <a
                      href={formData.amazonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-900"
                      title="Test Amazon URL"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
                {errors.amazonUrl && (
                  <p className="text-xs text-rose-500 mt-1">{errors.amazonUrl}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Flipkart Product URL (Optional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.flipkartUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, flipkartUrl: e.target.value });
                      if (errors.flipkartUrl) setErrors({ ...errors, flipkartUrl: null });
                    }}
                    placeholder="https://www.flipkart.com/sony-wh-1000xm5/p/itm..."
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 pr-10 ${
                      errors.flipkartUrl
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-neutral-200 focus:ring-neutral-900'
                    }`}
                  />
                  {formData.flipkartUrl && (
                    <a
                      href={formData.flipkartUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-900"
                      title="Test Flipkart URL"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
                {errors.flipkartUrl && (
                  <p className="text-xs text-rose-500 mt-1">{errors.flipkartUrl}</p>
                )}
              </div>
            </div>

            {/* Product Photography & Live Preview */}
            <div id="section-photo" className="space-y-4 scroll-mt-6">
              <div className="border-b border-neutral-100 pb-1.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    4. Product Photography & Media <span className="text-rose-500">*</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Click to select from your Mac/PC, drag & drop, paste (Cmd+V), or enter a link.
                  </p>
                </div>
                {uploadSuccessNote && (
                  <span className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                    <CheckCircle2 size={11} className="text-emerald-600" />
                    <span>{uploadSuccessNote}</span>
                  </span>
                )}
              </div>

              {errors.imageUrl && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-500" />
                  <span>{errors.imageUrl}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-3.5">
                  {/* File Upload Dropzone with Native File Input Overlay (100% Safari Compatible) */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Upload Image File <span className="text-emerald-600 font-medium">(Fast & Auto-optimized)</span>
                    </label>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all select-none text-center ${
                        isDragOver
                          ? 'border-neutral-900 bg-neutral-100 scale-[1.01]'
                          : isUploadingImage
                          ? 'border-neutral-300 bg-neutral-50 cursor-wait'
                          : errors.imageUrl
                          ? 'border-rose-400 bg-rose-50/40'
                          : 'border-neutral-300 hover:border-neutral-900 bg-neutral-50/70 hover:bg-neutral-100/70'
                      }`}
                    >
                      {/* Native file input overlay - guarantees click works natively in Safari macOS */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        onChange={handleFileInputChange}
                        disabled={isUploadingImage}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        title="Click to choose image file from computer"
                      />

                      {isUploadingImage ? (
                        <div className="flex flex-col items-center justify-center py-2 space-y-2 pointer-events-none">
                          <Loader2 size={24} className="animate-spin text-neutral-900" />
                          <span className="text-xs font-bold text-neutral-800">
                            Uploading image...
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            Optimizing for display...
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                          <div className="w-11 h-11 rounded-2xl bg-white shadow-xs border border-neutral-200/80 flex items-center justify-center text-neutral-700">
                            <Upload size={18} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-neutral-900 block">
                              Click anywhere to choose photo from computer
                            </span>
                            <span className="text-[11px] text-neutral-500 mt-0.5 block">
                              or drag and drop here, or press Cmd+V to paste
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-400 bg-white/90 border border-neutral-200/70 px-2.5 py-0.5 rounded-full font-medium">
                            PNG, JPG, WebP up to 10MB
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Or Manual Image URL Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-neutral-700">
                        Or Paste Web Image URL
                      </label>
                      {formData.imageUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, imageUrl: '' }));
                            setLocalPreview('');
                            setPreviewError(false);
                            setUploadSuccessNote('');
                          }}
                          className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                        >
                          Clear Image
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        setFormData((prev) => ({ ...prev, imageUrl: val }));
                        setLocalPreview(val);
                        setPreviewError(false);
                        setUploadSuccessNote(val ? '✓ URL image set' : '');
                        if (errors.imageUrl) setErrors((prev) => ({ ...prev, imageUrl: null }));
                      }}
                      placeholder="https://images.unsplash.com/... or https://m.media-amazon.com/..."
                      className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 font-mono ${
                        errors.imageUrl
                          ? 'border-rose-400 focus:ring-rose-500'
                          : 'border-neutral-200 focus:ring-neutral-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Live Storefront Appearance Preview Tile */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-neutral-700">
                      Storefront Appearance Preview
                    </label>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                      Live 4:5 Card
                    </span>
                  </div>

                  <div className="w-full h-64 bg-[#F5F2F9] rounded-2xl flex items-center justify-center p-4 border border-neutral-200/70 overflow-hidden relative group">
                    {localPreview && !previewError ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={localPreview}
                          alt="Product Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain filter contrast-[1.02] drop-shadow-md transition-transform group-hover:scale-105 duration-300"
                          onError={() => setPreviewError(true)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, imageUrl: '' }));
                            setLocalPreview('');
                            setUploadSuccessNote('');
                          }}
                          className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black text-white text-[10.5px] font-semibold backdrop-blur-sm transition-colors cursor-pointer"
                          title="Remove loaded image"
                        >
                          Change Photo
                        </button>
                      </div>
                    ) : previewError ? (
                      <div className="flex flex-col items-center justify-center text-center p-4 text-rose-600 space-y-1.5">
                        <AlertCircle size={28} className="text-rose-500" />
                        <span className="text-xs font-bold">Image preview unavailable</span>
                        <p className="text-[11px] text-neutral-500 max-w-xs leading-snug">
                          The URL could not be loaded. Please click the upload box to choose an image from your computer.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-neutral-400 text-xs text-center p-4 space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-white/80 border border-neutral-200/60 flex items-center justify-center text-neutral-300 shadow-2xs">
                          <ImageIcon size={24} strokeWidth={1.5} />
                        </div>
                        <div>
                          <span className="font-semibold text-neutral-600 block">No photo loaded yet</span>
                          <span className="text-[11px] text-neutral-400 mt-0.5 block">
                            Upload a photo or paste a link to preview
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="absolute top-2 right-2 bg-neutral-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm pointer-events-none">
                      Preview
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Publishing Status & Flags */}
            <div id="section-publishing" className="space-y-4 scroll-mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-1">
                5. Publication & Visibility
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50">
                  <div>
                    <span className="text-xs font-semibold text-neutral-900 block">
                      Publication Status
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {formData.status === 'published'
                        ? 'Visible in public catalogue'
                        : 'Hidden as curator draft'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        status: formData.status === 'published' ? 'draft' : 'published',
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.status === 'published' ? 'bg-emerald-600' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.status === 'published' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50">
                  <div>
                    <span className="text-xs font-semibold text-neutral-900 block">
                      Featured Product
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Highlighted in curator selections
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isFeatured ? 'bg-neutral-900' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isFeatured ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Footer Actions */}
          <div className="px-4 sm:px-8 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
            {isEditing ? (
              <button
                type="button"
                onClick={() => {
                  onDelete?.(product);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/90 shadow-xs transition-colors cursor-pointer"
                title="Remove this product from catalog"
              >
                <Trash2 size={14} />
                <span>Remove Product</span>
              </button>
            ) : <div className="hidden sm:block" />}

            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
              {Object.keys(errors).length > 0 && (
                <span className="hidden sm:flex text-[11px] font-medium text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg items-center space-x-1">
                  <AlertCircle size={12} />
                  <span>Check fields</span>
                </span>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 sm:bg-transparent hover:bg-neutral-200/60 transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-neutral-900 hover:bg-black transition-colors shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Check size={14} />
                <span>{isEditing ? 'Save Changes' : 'Publish Product'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


