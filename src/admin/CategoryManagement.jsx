import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  Move,
} from 'lucide-react';
import { slugify } from '../context/StoreContext';

export default function CategoryManagement({
  categories,
  products,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onDeleteWithReassignment,
  onToggleEnabled,
  onReorderCategories,
  showToast,
}) {
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [reassignTargetCatId, setReassignTargetCatId] = useState('');

  // Form input state
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formError, setFormError] = useState('');

  // Open Add modal
  const handleOpenAdd = () => {
    setFormName('');
    setFormSlug('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug || cat.id);
    setFormError('');
  };

  // Submit Add
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Category name is required.');
      return;
    }

    const res = onAddCategory({ name: formName, slug: formSlug });
    if (res.success) {
      showToast({
        title: 'Category Created',
        message: `"${formName}" category has been created.`,
      });
      setIsAddModalOpen(false);
    } else {
      setFormError(res.error || 'Failed to create category.');
    }
  };

  // Submit Edit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Category name is required.');
      return;
    }

    onUpdateCategory(editingCategory.id, { name: formName, slug: formSlug });
    showToast({
      title: 'Category Updated',
      message: `"${formName}" category was updated.`,
    });
    setEditingCategory(null);
  };

  // Move up/down in ordering
  const handleMove = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    const reordered = [...categories];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, movedItem);

    onReorderCategories(reordered);
    showToast({
      title: 'Order Updated',
      message: `Category sequence reordered.`,
    });
  };

  // Handle Delete Click
  const handleDeleteClick = (cat) => {
    const productCount = products.filter((p) => p.category === cat.id).length;
    setCategoryToDelete({ ...cat, productCount });
    // Default reassignment target to first other category
    const otherCat = categories.find((c) => c.id !== cat.id && c.id !== 'all');
    setReassignTargetCatId(otherCat ? otherCat.id : 'accessories');
  };

  // Confirm delete or delete with reassignment
  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;

    if (categoryToDelete.productCount > 0) {
      // Must reassign products
      onDeleteWithReassignment(categoryToDelete.id, reassignTargetCatId);
      const targetName = categories.find((c) => c.id === reassignTargetCatId)?.name || 'Accessories';
      showToast({
        title: 'Category Migrated & Deleted',
        message: `${categoryToDelete.productCount} product(s) reassigned to "${targetName}" and category "${categoryToDelete.name}" deleted.`,
      });
    } else {
      // Safe delete
      const res = onDeleteCategory(categoryToDelete.id);
      if (res.success) {
        showToast({
          title: 'Category Deleted',
          message: `Category "${categoryToDelete.name}" was removed.`,
        });
      }
    }
    setCategoryToDelete(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Category Management
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Organize catalog disciplines, reorder sidebar filters, and assign specimens.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-neutral-900 hover:bg-black transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Create New Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6 w-16 text-center">Order</th>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">URL Slug</th>
                <th className="py-3 px-4 text-center">Assigned Products</th>
                <th className="py-3 px-4">Storefront Status</th>
                <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs sm:text-sm">
              {categories.map((cat, index) => {
                const productCount = products.filter((p) => p.category === cat.id).length;
                const isAllCategory = cat.id === 'all';

                return (
                  <tr key={cat.id} className="hover:bg-neutral-50/70 transition-colors group">
                    {/* Reorder Buttons */}
                    <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded text-neutral-400 hover:text-neutral-900 disabled:opacity-20 disabled:hover:text-neutral-400 transition-colors"
                          title="Move Up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <span className="font-mono text-neutral-400 text-xs w-4 text-center">
                          {index + 1}
                        </span>
                        <button
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === categories.length - 1}
                          className="p-1 rounded text-neutral-400 hover:text-neutral-900 disabled:opacity-20 disabled:hover:text-neutral-400 transition-colors"
                          title="Move Down"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4 font-semibold text-neutral-900 whitespace-nowrap">
                      {cat.name}
                      {isAllCategory && (
                        <span className="ml-2 text-[10px] uppercase font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                          System Default
                        </span>
                      )}
                    </td>

                    {/* Slug */}
                    <td className="py-3.5 px-4 font-mono text-neutral-500 text-xs whitespace-nowrap">
                      /{cat.slug || cat.id}
                    </td>

                    {/* Product count */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          productCount > 0
                            ? 'bg-neutral-100 text-neutral-800'
                            : 'bg-neutral-50 text-neutral-400'
                        }`}
                      >
                        {isAllCategory ? products.length : productCount}
                      </span>
                    </td>

                    {/* Enabled / Disabled Toggle */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => onToggleEnabled(cat.id)}
                        disabled={isAllCategory}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors disabled:opacity-50 ${
                          cat.enabled !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                        }`}
                      >
                        {cat.enabled !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span>{cat.enabled !== false ? 'Enabled' : 'Disabled'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                          title="Edit category"
                        >
                          <Edit size={15} />
                        </button>
                        {!isAllCategory && (
                          <button
                            onClick={() => handleDeleteClick(cat)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete category"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-neutral-200 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="text-lg font-bold text-neutral-900">Create New Category</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    setFormSlug(slugify(e.target.value));
                    setFormError('');
                  }}
                  placeholder="e.g. Workspace Audio"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(slugify(e.target.value))}
                  placeholder="e.g. workspace-audio"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              {formError && <p className="text-xs text-rose-500">{formError}</p>}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-neutral-900 hover:bg-black transition-colors shadow-sm"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-neutral-200 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="text-lg font-bold text-neutral-900">Edit Category</h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    setFormError('');
                  }}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(slugify(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              {formError && <p className="text-xs text-rose-500">{formError}</p>}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-neutral-900 hover:bg-black transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Reassign Category Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-neutral-900">
                {categoryToDelete.productCount > 0
                  ? 'Reassign Products Before Deletion'
                  : 'Delete Category'}
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                {categoryToDelete.productCount > 0 ? (
                  <>
                    The category <strong className="text-neutral-800">"{categoryToDelete.name}"</strong>{' '}
                    contains <strong className="text-neutral-900">{categoryToDelete.productCount}</strong>{' '}
                    active product(s). To prevent orphaned specimens, please choose where to reassign them:
                  </>
                ) : (
                  <>
                    Are you sure you want to delete <strong className="text-neutral-800">"{categoryToDelete.name}"</strong>? This category contains no products.
                  </>
                )}
              </p>
            </div>

            {/* Reassignment Target Dropdown */}
            {categoryToDelete.productCount > 0 && (
              <div className="pt-1">
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Reassign products to:
                </label>
                <select
                  value={reassignTargetCatId}
                  onChange={(e) => setReassignTargetCatId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer"
                >
                  {categories
                    .filter((c) => c.id !== categoryToDelete.id && c.id !== 'all')
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="pt-2 flex justify-end space-x-2.5">
              <button
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
              >
                {categoryToDelete.productCount > 0 ? 'Migrate & Delete' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

