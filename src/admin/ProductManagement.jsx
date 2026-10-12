import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Image as ImageIcon,
} from 'lucide-react';
import ProductFormModal from './ProductFormModal';

export default function ProductManagement({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleStatus,
  onToggleFeatured,
  showToast,
  isAddModalOpenInitially = false,
  onCloseAddModalInitially,
}) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState('all'); // 'all' | 'both' | 'amazon' | 'flipkart'
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'published' | 'draft' | 'featured'
  const [sortBy, setSortBy] = useState('updated-desc'); // 'updated-desc' | 'name-asc' | 'price-asc' | 'price-desc'

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(isAddModalOpenInitially);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Sync initial prop if opened from overview
  React.useEffect(() => {
    if (isAddModalOpenInitially) {
      setIsFormModalOpen(true);
      setEditingProduct(null);
      if (onCloseAddModalInitially) onCloseAddModalInitially();
    }
  }, [isAddModalOpenInitially, onCloseAddModalInitially]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = p.name?.toLowerCase().includes(q);
          const matchesSlug = p.slug?.toLowerCase().includes(q);
          if (!matchesName && !matchesSlug) return false;
        }

        // Store destination filter
        const hasAmz = Boolean(p.amazonUrl && p.amazonUrl.trim());
        const hasFk = Boolean(p.flipkartUrl && p.flipkartUrl.trim());
        if (selectedStore === 'both' && (!hasAmz || !hasFk)) return false;
        if (selectedStore === 'amazon' && !hasAmz) return false;
        if (selectedStore === 'flipkart' && !hasFk) return false;

        // Status filter
        if (selectedStatus === 'published' && p.status !== 'published') return false;
        if (selectedStatus === 'draft' && p.status !== 'draft') return false;
        if (selectedStatus === 'featured' && !p.isFeatured) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
        if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
        if (sortBy === 'price-asc') return (a.priceValue || 0) - (b.priceValue || 0);
        if (sortBy === 'price-desc') return (b.priceValue || 0) - (a.priceValue || 0);
        // Default recently updated
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      });
  }, [products, searchQuery, selectedStore, selectedStatus, sortBy]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    const isEdit = Boolean(editingProduct);
    const prodId = editingProduct?.id;
    const prodName = formData.name;

    // 1. Immediately dismiss modal with 0ms UI delay
    setIsFormModalOpen(false);
    setEditingProduct(null);

    // 2. Instant feedback toast
    showToast({
      title: isEdit ? 'Product Updated' : 'Product Added',
      message: `"${prodName}" saved successfully.`,
    });

    // 3. Persist asynchronously in background
    try {
      if (isEdit) {
        const res = await onUpdateProduct(prodId, formData);
        if (res?.error) {
          showToast({ title: 'Notice', message: res.error, type: 'error' });
        }
      } else {
        const res = await onAddProduct(formData);
        if (res?.error) {
          showToast({ title: 'Notice', message: res.error, type: 'error' });
        }
      }
    } catch (err) {
      showToast({ title: 'Error', message: err?.message || 'Could not save product', type: 'error' });
    }
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete.id);
      showToast({
        title: 'Product Deleted',
        message: `"${productToDelete.name}" was removed from the store.`,
      });
      setProductToDelete(null);
    }
  };

  const handleToggleStatusClick = (p) => {
    onToggleStatus(p.id);
    const nextStatus = p.status === 'published' ? 'Draft' : 'Published';
    showToast({
      title: 'Status Updated',
      message: `"${p.name}" is now set to ${nextStatus}.`,
    });
  };

  const handleToggleFeaturedClick = (p) => {
    onToggleFeatured(p.id);
    const nextState = !p.isFeatured ? 'marked as Featured' : 'unmarked as Featured';
    showToast({
      title: 'Featured Status',
      message: `"${p.name}" has been ${nextState}.`,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Product Management
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Curate, edit, and organize specimens across Amazon & Flipkart.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-neutral-900 hover:bg-black transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, slug, or category..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Store Partner Filter */}
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none cursor-pointer text-neutral-700"
          >
            <option value="all">All Store Destinations</option>
            <option value="both">Both Stores (Chooser Modal)</option>
            <option value="amazon">Amazon Available</option>
            <option value="flipkart">Flipkart Available</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none cursor-pointer text-neutral-700"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
            <option value="featured">Featured Only</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none cursor-pointer text-neutral-700"
          >
            <option value="updated-desc">Recently Updated</option>
            <option value="name-asc">Name (A → Z)</option>
            <option value="name-desc">Name (Z → A)</option>
            <option value="price-asc">Price (Low → High)</option>
            <option value="price-desc">Price (High → Low)</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE PRODUCT LIST (< lg): Native touch-friendly cards with Edit button   */}
      {/* ========================================================================= */}
      <div className="block lg:hidden space-y-3.5">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-neutral-400 border border-neutral-200">
            <p className="font-medium text-sm text-neutral-600">No products found</p>
            <p className="text-xs text-neutral-400 mt-1">Try adjusting your search query or filters.</p>
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-xs flex flex-col space-y-3.5"
            >
              <div className="flex items-start space-x-3.5">
                {/* Thumbnail */}
                <div
                  onClick={() => handleOpenEdit(p)}
                  className="w-16 h-16 rounded-xl bg-[#F5F2F9] p-1.5 shrink-0 flex items-center justify-center overflow-hidden border border-neutral-100 cursor-pointer hover:opacity-85 transition-opacity"
                  title="Click to edit product"
                >
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <h4
                    onClick={() => handleOpenEdit(p)}
                    className="font-bold text-neutral-900 text-sm leading-snug line-clamp-2 cursor-pointer hover:text-purple-700 transition-colors"
                  >
                    {p.name}
                  </h4>

                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-sm font-extrabold text-neutral-900">{p.displayPrice}</span>
                    {p.originalPrice && (
                      <span className="text-xs text-neutral-400 line-through">{p.originalPrice}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {/* Store badge */}
                    {p.amazonUrl && p.flipkartUrl ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Both Stores (Popup)
                      </span>
                    ) : p.amazonUrl ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
                        Amazon Direct
                      </span>
                    ) : p.flipkartUrl ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Flipkart Direct
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400">No URL</span>
                    )}

                    {/* Status badge toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatusClick(p)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 cursor-pointer ${
                        p.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                      title="Click to toggle status"
                    >
                      {p.status === 'published' ? <Eye size={10} /> : <EyeOff size={10} />}
                      <span className="capitalize">{p.status}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-2.5 border-t border-neutral-100 flex items-center space-x-2">
                {/* PROMINENT EDIT BUTTON */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(p)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-black text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <Edit size={14} />
                  <span>Edit Product</span>
                </button>

                {/* PROMINENT REMOVE BUTTON */}
                <button
                  type="button"
                  onClick={() => setProductToDelete(p)}
                  className="py-2.5 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center justify-center space-x-1.5 border border-rose-200/90 shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
                  title="Remove product"
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP TABLE VIEW (lg+): Full table with prominent Edit buttons          */}
      {/* ========================================================================= */}
      <div className="hidden lg:block bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6">Product</th>
                <th className="py-3 px-4">Store Routing Mode</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Featured</th>
                <th className="py-3 px-4">Affiliate Gateway</th>
                <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs sm:text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-neutral-400">
                    <p className="font-medium text-sm text-neutral-600">No products found</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Try adjusting your search query or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors group">
                    {/* Thumbnail & Product Name */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center space-x-3.5 min-w-[220px]">
                        <div
                          onClick={() => handleOpenEdit(p)}
                          className="w-12 h-12 rounded-xl bg-[#F5F2F9] p-1.5 shrink-0 flex items-center justify-center overflow-hidden border border-neutral-100 cursor-pointer hover:opacity-80 transition-opacity"
                          title="Click to edit"
                        >
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <span
                            onClick={() => handleOpenEdit(p)}
                            className="font-semibold text-neutral-900 block truncate max-w-xs cursor-pointer hover:text-purple-700 transition-colors"
                            title="Click to edit product"
                          >
                            {p.name}
                          </span>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-[11px] text-neutral-400 font-mono truncate max-w-[140px]">
                              /{p.slug}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 flex items-center space-x-0.5 cursor-pointer"
                            >
                              <Edit size={10} />
                              <span>Edit</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Store Routing Mode */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {p.amazonUrl && p.flipkartUrl ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
                          <span>Both (Chooser Modal)</span>
                        </span>
                      ) : p.amazonUrl ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-semibold border border-neutral-200">
                          <span>Amazon (Direct 1-Click)</span>
                        </span>
                      ) : p.flipkartUrl ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                          <span>Flipkart (Direct 1-Click)</span>
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400">No URL</span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-neutral-900">{p.displayPrice}</span>
                        {p.originalPrice && (
                          <span className="text-[11px] line-through text-neutral-400">
                            {p.originalPrice}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Published / Draft toggle badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatusClick(p)}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                          p.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {p.status === 'published' ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span className="capitalize">{p.status}</span>
                      </button>
                    </td>

                    {/* Featured toggle */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleFeaturedClick(p)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          p.isFeatured
                            ? 'bg-violet-50 text-violet-600 hover:bg-violet-100'
                            : 'text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100'
                        }`}
                        title={p.isFeatured ? 'Featured product (click to unfeature)' : 'Mark as featured'}
                      >
                        <Sparkles size={16} />
                      </button>
                    </td>

                    {/* Affiliate Links & Live Gateway */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {p.amazonUrl && (
                          <a
                            href={`/api/go/${p.id}/amazon`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-neutral-900 text-white hover:bg-black text-[11px] font-semibold transition-colors shadow-xs"
                            title="Test Amazon Gateway Redirect"
                          >
                            <span>Amazon</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                        {p.flipkartUrl && (
                          <a
                            href={`/api/go/${p.id}/flipkart`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#2874F0] text-white hover:bg-blue-600 text-[11px] font-semibold transition-colors shadow-xs"
                            title="Test Flipkart Gateway Redirect"
                          >
                            <span>Flipkart</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                        {p.clickCount !== undefined && (
                          <span className="text-[11px] text-neutral-500 font-medium ml-1" title="Tracked affiliate redirects">
                            {p.clickCount} {p.clickCount === 1 ? 'click' : 'clicks'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions - Prominent High-Contrast Edit & Remove Buttons */}
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 text-white hover:bg-black text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                          title="Edit product details, price, and affiliate links"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductToDelete(p)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200/90 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                          title={`Remove "${p.name}" from store`}
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Count */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500">
          <span>
            Showing <strong className="text-neutral-900">{filteredProducts.length}</strong> of{' '}
            <strong className="text-neutral-900">{products.length}</strong> total specimens
          </span>
          <span className="text-[11px] text-neutral-400 mt-1 sm:mt-0">
            Changes synchronize instantly with the public storefront.
          </span>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleFormSubmit}
        onDelete={(prod) => {
          setIsFormModalOpen(false);
          setProductToDelete(prod);
        }}
        product={editingProduct}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-neutral-900">Remove Product from Store?</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Are you sure you want to remove{' '}
                <strong className="text-neutral-900 font-semibold">"{productToDelete.name}"</strong>? This will
                immediately delete it from the catalog and live storefront.
              </p>
            </div>

            <div className="pt-2 flex justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm cursor-pointer inline-flex items-center space-x-1.5"
              >
                <Trash2 size={13} />
                <span>Yes, Remove Product</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

