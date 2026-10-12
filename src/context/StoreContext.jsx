import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../api/client';
import { DEFAULT_SETTINGS, DEFAULT_CATEGORIES, INITIAL_PRODUCTS, slugify } from '../data/products';

export { slugify };

const StoreContext = createContext(null);

const VIRTUAL_ALL_CATEGORY = {
  id: 'all',
  name: 'All Collection',
  slug: 'all',
  enabled: true,
  order: 0,
};

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Authentication State
  const [adminUser, setAdminUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const isAuthenticated = Boolean(adminUser);

  // Broadcast catalog mutations across all open browser tabs / windows
  const notifyCatalogChanged = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        if ('BroadcastChannel' in window) {
          const channel = new BroadcastChannel('curated_discovery_sync');
          channel.postMessage({ type: 'CATALOG_MUTATED', timestamp: Date.now() });
          channel.close();
        }
        localStorage.setItem('curated_discovery_last_sync', String(Date.now()));
      }
    } catch {
      // Non-critical fallback
    }
  }, []);

  // Fetch Public Catalog (Categories & Published Products)
  const fetchPublicData = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      setError(null);

      const [catRes, prodRes, setRes] = await Promise.all([
        api.getCategories(),
        api.getProducts({ limit: 100 }),
        api.getSettings().catch(() => null),
      ]);

      if (catRes.categories && catRes.categories.length > 0) {
        const fetchedCategories = catRes.categories.sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );
        setCategories([VIRTUAL_ALL_CATEGORY, ...fetchedCategories]);
      }

      if (prodRes.products && prodRes.products.length > 0) {
        setProducts(prodRes.products);
      }

      if (setRes?.settings) {
        setSettings((prev) => ({ ...prev, ...setRes.settings }));
      }
    } catch (err) {
      console.warn('Backend API unavailable, using initial curated catalog:', err);
      // Fallback to initial curated data so storefront never renders blank
      setCategories(DEFAULT_CATEGORIES);
      setProducts(INITIAL_PRODUCTS);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Fetch Admin Catalog (includes Drafts & full stats)
  const fetchAdminData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [catRes, prodRes, setRes] = await Promise.all([
        api.getAdminCategories(),
        api.getAdminProducts({ limit: 100 }),
        api.getAdminSettings().catch(() => null),
      ]);

      const fetchedCategories = (catRes.categories || []).sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );

      setCategories([VIRTUAL_ALL_CATEGORY, ...fetchedCategories]);
      setProducts(prodRes.products || []);

      if (setRes?.settings) {
        setSettings((prev) => ({ ...prev, ...setRes.settings }));
      }
    } catch (err) {
      console.error('Failed fetching admin data from backend API:', err);
      setError(err.message || 'Unable to load admin catalogue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check Current Session on App Mount (only if visiting /admin)
  useEffect(() => {
    async function checkSession() {
      const isAdminRoute = typeof window !== 'undefined' && (
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.startsWith('#/admin') ||
        window.location.search.includes('admin=true')
      );

      if (isAdminRoute) {
        try {
          setIsAuthChecking(true);
          const res = await api.getMe();
          if (res.user) {
            setAdminUser(res.user);
            await fetchAdminData();
            return;
          }
        } catch {
          const storedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('curator_token') : null;
          if (!storedToken) {
            setAdminUser(null);
          }
        } finally {
          setIsAuthChecking(false);
        }
      } else {
        setIsAuthChecking(false);
      }

      await fetchPublicData();
    }

    checkSession();
  }, [fetchAdminData, fetchPublicData]);

  // Real-Time Auto-Refresh Sync (Multi-tab Broadcast, Tab Focus Revalidation, & 5-Second Background Polling)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Cross-tab BroadcastChannel listener
    let channel = null;
    if ('BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('curated_discovery_sync');
        channel.onmessage = (event) => {
          if (event.data?.type === 'CATALOG_MUTATED') {
            if (adminUser) {
              fetchAdminData();
            } else {
              fetchPublicData(true);
            }
          }
        };
      } catch {
        // Fallback to storage events
      }
    }

    // 2. Storage event fallback for cross-tab sync
    const handleStorage = (e) => {
      if (e.key === 'curated_discovery_last_sync') {
        if (adminUser) {
          fetchAdminData();
        } else {
          fetchPublicData(true);
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Tab Visibility Auto-Revalidation (when switching browser tabs)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (adminUser) {
          fetchAdminData();
        } else {
          fetchPublicData(true);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Lightweight Background Polling Heartbeat (every 30 seconds when tab is open)
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        if (adminUser) {
          fetchAdminData();
        } else {
          fetchPublicData(true);
        }
      }
    }, 30000);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(pollInterval);
    };
  }, [adminUser, fetchAdminData, fetchPublicData]);

  // Derived Public Data: only published products and enabled categories
  const publicCategories = useMemo(() => {
    const enabled = categories
      .filter((cat) => cat.enabled !== false && cat.id !== 'all')
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    return [VIRTUAL_ALL_CATEGORY, ...enabled];
  }, [categories]);

  const publicProducts = useMemo(() => {
    return products.filter((prod) => prod.status === 'published');
  }, [products]);

  // --- AUTH ACTIONS ---

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      setAdminUser(res.user);
      await fetchAdminData();
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, error: err.message || 'Authentication failed' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setAdminUser(null);
      await fetchPublicData();
    }
  };

  // --- PRODUCT ACTIONS (Backed by Backend API) ---

  // --- PRODUCT ACTIONS (Backed by Backend API with Instant Optimistic Updates) ---

  const addProduct = async (productInput) => {
    try {
      const payload = {
        name: productInput.name?.trim(),
        slug: productInput.slug?.trim() || undefined,
        categoryId: productInput.category,
        imageUrl: productInput.imageUrl?.trim(),
        displayPrice: productInput.displayPrice?.trim(),
        priceAmount: Number(productInput.priceValue) || 0,
        originalPrice: productInput.originalPrice?.trim() || undefined,
        originalPriceAmount: productInput.originalPriceAmount ? Number(productInput.originalPriceAmount) : undefined,
        verifiedPriceSource: productInput.verifiedPriceSource?.trim() || 'Curator Direct',
        amazonUrl: productInput.amazonUrl?.trim(),
        flipkartUrl: productInput.flipkartUrl?.trim(),
        shortDescription: productInput.shortDescription?.trim() || '',
        description: productInput.description?.trim() || '',
        aspectRatio: productInput.aspectRatio || 'aspect-[3/4]',
        heightClass: productInput.heightClass || 'h-80 sm:h-96 lg:h-[410px]',
        status: productInput.status || 'published',
        isFeatured: Boolean(productInput.isFeatured),
      };

      const res = await api.createProduct(payload);
      if (res.product) {
        setProducts((prev) => [res.product, ...prev]);
        notifyCatalogChanged();
        return { success: true, product: res.product };
      }
      return { success: false, error: 'Failed to create product' };
    } catch (err) {
      return { success: false, error: err.message || 'Error creating product' };
    }
  };

  const updateProduct = async (id, updatedFields) => {
    try {
      // 1. Instant Optimistic State Update in UI (0ms delay)
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            ...updatedFields,
            updatedAt: new Date().toISOString(),
          };
        })
      );

      const payload = { ...updatedFields };
      if (payload.priceValue !== undefined) {
        payload.priceAmount = Number(payload.priceValue);
        delete payload.priceValue;
      }
      if (payload.category !== undefined) {
        payload.categoryId = payload.category;
        delete payload.category;
      }

      // 2. Persist to server/Supabase
      const res = await api.updateProduct(id, payload);
      if (res.product) {
        // Sync full normalized product from server without re-fetching all items
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...res.product } : p))
        );
        notifyCatalogChanged();
        return { success: true, product: res.product };
      }
      return { success: false, error: 'Failed to update product' };
    } catch (err) {
      // On failure, rollback by refreshing
      await fetchAdminData();
      return { success: false, error: err.message || 'Error updating product' };
    }
  };

  const deleteProduct = async (id) => {
    try {
      // Optimistic delete (0ms)
      setProducts((prev) => prev.filter((p) => p.id !== id));
      await api.deleteProduct(id);
      notifyCatalogChanged();
      return { success: true };
    } catch (err) {
      await fetchAdminData();
      return { success: false, error: err.message || 'Error deleting product' };
    }
  };

  const toggleProductStatus = async (id, overrideStatus) => {
    try {
      const target = products.find((p) => p.id === id);
      const newStatus = overrideStatus || (target?.status === 'published' ? 'draft' : 'published');
      // Optimistic toggle (0ms)
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
      const res = await api.togglePublish(id, newStatus);
      if (res.product) {
        notifyCatalogChanged();
        return { success: true, product: res.product };
      }
      return { success: false };
    } catch (err) {
      await fetchAdminData();
      return { success: false, error: err.message };
    }
  };

  const toggleProductFeatured = async (id) => {
    try {
      const target = products.find((p) => p.id === id);
      const nextFeatured = !target?.isFeatured;
      // Optimistic toggle (0ms)
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isFeatured: nextFeatured } : p))
      );
      const res = await api.updateProduct(id, { isFeatured: nextFeatured });
      if (res.product) {
        notifyCatalogChanged();
        return { success: true, product: res.product };
      }
      return { success: false };
    } catch (err) {
      await fetchAdminData();
      return { success: false, error: err.message };
    }
  };

  // --- CATEGORY ACTIONS (Backed by Backend API) ---

  const addCategory = async (categoryInput) => {
    try {
      const payload = {
        name: categoryInput.name?.trim(),
        slug: categoryInput.slug?.trim() || undefined,
        order: categoryInput.order ? Number(categoryInput.order) : undefined,
        enabled: categoryInput.enabled !== false,
      };

      const res = await api.createCategory(payload);
      if (res.category) {
        await fetchAdminData();
        notifyCatalogChanged();
        return { success: true, category: res.category };
      }
      return { success: false };
    } catch (err) {
      return { success: false, error: err.message || 'Error creating category' };
    }
  };

  const updateCategory = async (id, updatedFields) => {
    try {
      const res = await api.updateCategory(id, updatedFields);
      if (res.category) {
        await fetchAdminData();
        notifyCatalogChanged();
        return { success: true, category: res.category };
      }
      return { success: false };
    } catch (err) {
      return { success: false, error: err.message || 'Error updating category' };
    }
  };

  const deleteCategory = async (id) => {
    try {
      await api.deleteCategory(id);
      await fetchAdminData();
      notifyCatalogChanged();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Error deleting category' };
    }
  };

  const deleteCategoryWithReassignment = async (categoryIdToDelete, reassignToCategoryId) => {
    try {
      await api.deleteCategory(categoryIdToDelete, reassignToCategoryId);
      await fetchAdminData();
      notifyCatalogChanged();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Error reassigning products' };
    }
  };

  const toggleCategoryEnabled = async (id) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return { success: false };
    return updateCategory(id, { enabled: !target.enabled });
  };

  const reorderCategories = async (id, direction) => {
    const realCats = categories.filter((c) => c.id !== 'all');
    const index = realCats.findIndex((c) => c.id === id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= realCats.length) return;

    const currentCat = realCats[index];
    const adjacentCat = realCats[targetIndex];

    await updateCategory(currentCat.id, { order: adjacentCat.order || 0 });
    await updateCategory(adjacentCat.id, { order: currentCat.order || 0 });
    await fetchAdminData();
    notifyCatalogChanged();
  };

  const updateSettings = async (newSettings) => {
    // 1. Instant optimistic update in React state
    setSettings((prev) => ({ ...prev, ...newSettings }));
    try {
      // 2. Persist to Express backend and data/settings.json
      const res = await api.updateSettings(newSettings);
      if (res?.settings) {
        setSettings(res.settings);
      }
      notifyCatalogChanged();
      return { success: true, settings: res?.settings };
    } catch (err) {
      console.error('Failed to persist settings to server:', err);
      return { success: false, error: err.message };
    }
  };

  const exportCatalogJson = () => {
    const catalogData = {
      version: '3.0.0',
      exportedAt: new Date().toISOString(),
      settings,
      categories: categories.filter((c) => c.id !== 'all'),
      products,
    };

    const blob = new Blob([JSON.stringify(catalogData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curated-discovery-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const value = {
    products,
    categories,
    publicProducts,
    publicCategories,
    settings,
    isLoading,
    error,
    adminUser,
    isAuthenticated,
    isAuthChecking,
    login,
    logout,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    toggleProductFeatured,
    addCategory,
    updateCategory,
    deleteCategory,
    deleteCategoryWithReassignment,
    toggleCategoryEnabled,
    reorderCategories,
    updateSettings,
    exportCatalogJson,
    refreshCatalog: adminUser ? fetchAdminData : fetchPublicData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
