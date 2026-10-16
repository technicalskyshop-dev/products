import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
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

function getCachedJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      if (Array.isArray(fallback) ? Array.isArray(parsed) && parsed.length > 0 : parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch {
    // Ignore storage or parse errors
  }
  return fallback;
}

function areProductsEqual(prevList, newList) {
  if (prevList === newList) return true;
  if (!prevList || !newList) return false;
  if (prevList.length !== newList.length) return false;
  for (let i = 0; i < prevList.length; i++) {
    const a = prevList[i];
    const b = newList[i];
    const aCat = typeof a.category === 'object' && a.category !== null ? a.category.id || a.category.slug : a.category || a.categoryId;
    const bCat = typeof b.category === 'object' && b.category !== null ? b.category.id || b.category.slug : b.category || b.categoryId;
    if (
      a.id !== b.id ||
      a.status !== b.status ||
      Boolean(a.isFeatured) !== Boolean(b.isFeatured) ||
      a.displayPrice !== b.displayPrice ||
      Number(a.priceAmount || 0) !== Number(b.priceAmount || 0) ||
      Number(a.priceValue || 0) !== Number(b.priceValue || 0) ||
      a.originalPrice !== b.originalPrice ||
      Number(a.originalPriceAmount || 0) !== Number(b.originalPriceAmount || 0) ||
      a.name !== b.name ||
      a.imageUrl !== b.imageUrl ||
      a.categoryId !== b.categoryId ||
      aCat !== bCat ||
      a.categoryLabel !== b.categoryLabel ||
      a.amazonUrl !== b.amazonUrl ||
      a.flipkartUrl !== b.flipkartUrl ||
      a.shortDescription !== b.shortDescription ||
      a.description !== b.description ||
      a.aspectRatio !== b.aspectRatio ||
      a.heightClass !== b.heightClass ||
      String(a.updatedAt || '') !== String(b.updatedAt || '')
    ) {
      return false;
    }
  }
  return true;
}

function areCategoriesEqual(prevList, newList) {
  if (prevList === newList) return true;
  if (!prevList || !newList) return false;
  if (prevList.length !== newList.length) return false;
  for (let i = 0; i < prevList.length; i++) {
    const a = prevList[i];
    const b = newList[i];
    if (
      a.id !== b.id ||
      a.name !== b.name ||
      a.slug !== b.slug ||
      Boolean(a.enabled) !== Boolean(b.enabled) ||
      Number(a.order || 0) !== Number(b.order || 0)
    ) {
      return false;
    }
  }
  return true;
}

function areSettingsEqual(prevSettings, newSettings) {
  if (prevSettings === newSettings) return true;
  if (!prevSettings || !newSettings) return false;
  try {
    return JSON.stringify(prevSettings) === JSON.stringify(newSettings);
  } catch {
    return false;
  }
}

function checkIsAdminRoute() {
  if (typeof window === 'undefined') return false;
  return (
    window.location.pathname.startsWith('/admin') ||
    window.location.hash.startsWith('#/admin') ||
    window.location.hash.startsWith('#admin') ||
    window.location.search.includes('admin=true')
  );
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(() => getCachedJson('curator_cached_products', INITIAL_PRODUCTS));
  const [categories, setCategories] = useState(() => getCachedJson('curator_cached_categories', DEFAULT_CATEGORIES));
  const [settings, setSettings] = useState(() => getCachedJson('curator_cached_settings', DEFAULT_SETTINGS));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Authentication State
  const [adminUser, setAdminUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(checkIsAdminRoute);

  const isAuthenticated = Boolean(adminUser);

  // Synchronization & Throttle Refs
  const inFlightPublicFetchRef = useRef(null);
  const lastPublicFetchTimeRef = useRef(0);
  const mountTimeRef = useRef(Date.now());
  const broadcastChannelRef = useRef(null);

  // Broadcast catalog mutations across all open browser tabs / windows and local components
  const notifyCatalogChanged = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const now = Date.now();
        // 1. Send message over long-lived BroadcastChannel (instant 0ms cross-tab sync)
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.postMessage({ type: 'CATALOG_MUTATED', timestamp: now });
        }
        // 2. Storage event fallback for cross-tab contexts
        localStorage.setItem('curated_discovery_last_sync', String(now));
        // 3. Same-tab local CustomEvent so components in THIS tab update with 0ms latency
        window.dispatchEvent(new CustomEvent('curated_discovery_local_mutation', { detail: { timestamp: now } }));
      }
    } catch {
      // Non-critical fallback
    }
  }, []);

  // Fetch Public Catalog (Categories & Published Products) with In-Flight Deduplication & Equality Checks
  const fetchPublicData = useCallback(async (silent = false, force = false) => {
    if (!force && inFlightPublicFetchRef.current) {
      return inFlightPublicFetchRef.current;
    }

    const promise = (async () => {
      try {
        if (!silent) setIsLoading(true);
        setError(null);

        const [catRes, prodRes, setRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ limit: 100 }),
          api.getSettings().catch(() => null),
        ]);

        if (Array.isArray(catRes?.categories)) {
          const fetchedCategories = catRes.categories.sort(
            (a, b) => (a.order || 0) - (b.order || 0)
          );
          const nextCategories = [VIRTUAL_ALL_CATEGORY, ...fetchedCategories];
          setCategories((prev) => {
            if (areCategoriesEqual(prev, nextCategories)) return prev;
            try { localStorage.setItem('curator_cached_categories', JSON.stringify(nextCategories)); } catch {}
            return nextCategories;
          });
        }

        if (Array.isArray(prodRes?.products)) {
          setProducts((prev) => {
            if (areProductsEqual(prev, prodRes.products)) return prev;
            try { localStorage.setItem('curator_cached_products', JSON.stringify(prodRes.products)); } catch {}
            return prodRes.products;
          });
        }

        if (setRes?.settings) {
          setSettings((prev) => {
            const nextSettings = { ...prev, ...setRes.settings };
            if (areSettingsEqual(prev, nextSettings)) return prev;
            try { localStorage.setItem('curator_cached_settings', JSON.stringify(nextSettings)); } catch {}
            return nextSettings;
          });
        }

        lastPublicFetchTimeRef.current = Date.now();
      } catch (err) {
        console.warn('Backend API unavailable, retaining curated catalog:', err);
      } finally {
        if (!silent) setIsLoading(false);
        inFlightPublicFetchRef.current = null;
      }
    })();

    inFlightPublicFetchRef.current = promise;
    return promise;
  }, []);

  // Fetch Admin Catalog (includes Drafts & full metrics) with Zero-Flicker Protection
  const fetchAdminData = useCallback(async (silent = true, force = false) => {
    try {
      if (!silent) setIsLoading(true);
      setError(null);

      const [catRes, prodRes, setRes] = await Promise.all([
        api.getAdminCategories(),
        api.getAdminProducts({ limit: 100 }),
        api.getAdminSettings().catch(() => null),
      ]);

      if (Array.isArray(catRes?.categories)) {
        const fetchedCategories = catRes.categories.sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );
        const nextCategories = [VIRTUAL_ALL_CATEGORY, ...fetchedCategories];
        setCategories((prev) => {
          if (areCategoriesEqual(prev, nextCategories)) return prev;
          try { localStorage.setItem('curator_cached_categories', JSON.stringify(nextCategories)); } catch {}
          return nextCategories;
        });
      }

      if (Array.isArray(prodRes?.products)) {
        setProducts((prev) => {
          if (areProductsEqual(prev, prodRes.products)) return prev;
          try { localStorage.setItem('curator_cached_products', JSON.stringify(prodRes.products)); } catch {}
          return prodRes.products;
        });
      }

      if (setRes?.settings) {
        setSettings((prev) => {
          const next = { ...prev, ...setRes.settings };
          if (areSettingsEqual(prev, next)) return prev;
          try { localStorage.setItem('curator_cached_settings', JSON.stringify(next)); } catch {}
          return next;
        });
      }
      lastPublicFetchTimeRef.current = Date.now();
    } catch (err) {
      console.error('Failed fetching admin data from backend API:', err);
      setError(err.message || 'Unable to load admin catalogue');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Check Current Session on App Mount (only if visiting /admin)
  useEffect(() => {
    async function checkSession() {
      const isAdminRoute = checkIsAdminRoute();

      if (isAdminRoute) {
        try {
          setIsAuthChecking(true);
          const res = await api.getMe();
          if (res?.user) {
            setAdminUser(res.user);
            await fetchAdminData(false);
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

  // Unified silent sync trigger across tab switch, cross-device polling, and BroadcastChannel
  const syncLatestCatalog = useCallback(async (force = false) => {
    if (adminUser) {
      await fetchAdminData(true, force);
    } else {
      await fetchPublicData(true, force);
    }
  }, [adminUser, fetchAdminData, fetchPublicData]);

  // Real-Time Auto-Refresh Sync (Multi-tab Broadcast, Instant Tab/Window Focus, & 2.5s Background Heartbeat)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Cross-tab BroadcastChannel listener (Instant 0ms sync between open tabs)
    let channel = null;
    if ('BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('curated_discovery_sync');
        broadcastChannelRef.current = channel;
        channel.onmessage = (event) => {
          if (event.data?.type === 'CATALOG_MUTATED') {
            syncLatestCatalog(true);
          }
        };
      } catch {
        // Fallback to storage events
      }
    }

    // 2. Storage event fallback for cross-tab sync
    const handleStorage = (e) => {
      if (e.key === 'curated_discovery_last_sync') {
        syncLatestCatalog(true);
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Same-tab local CustomEvent listener (Instant local sync)
    const handleLocalMutation = () => {
      syncLatestCatalog(true);
    };
    window.addEventListener('curated_discovery_local_mutation', handleLocalMutation);

    // 4. Tab Visibility & Window Focus Auto-Revalidation (when switching browser tabs/windows)
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        // Allow immediate revalidation on tab focus, debounced to 500ms
        if (now - lastPublicFetchTimeRef.current < 500) return;
        syncLatestCatalog(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    // 5. Ultra-responsive Background Polling Heartbeat (every 2.5 seconds)
    // Ensures other devices (mobile phones, secondary screens) update automatically in near real-time
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastPublicFetchTimeRef.current < 2000) return;
        syncLatestCatalog(false);
      }
    }, 2500);

    return () => {
      if (channel) {
        channel.close();
        broadcastChannelRef.current = null;
      }
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('curated_discovery_local_mutation', handleLocalMutation);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      clearInterval(pollInterval);
    };
  }, [syncLatestCatalog]);

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

  const updateAdminCredentials = async (credentials) => {
    try {
      const res = await api.updateAdminCredentials(credentials);
      if (res?.user) {
        setAdminUser(res.user);
      }
      return { success: true, message: res?.message || 'Credentials updated successfully', user: res?.user };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to update admin credentials' };
    }
  };

  // --- PRODUCT ACTIONS (Backed by Backend API) ---

  // --- PRODUCT ACTIONS (Backed by Backend API with Instant Optimistic Updates) ---

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
        setProducts((prev) => {
          const next = [res.product, ...prev.filter((p) => p.id !== res.product.id)];
          try { localStorage.setItem('curator_cached_products', JSON.stringify(next)); } catch {}
          return next;
        });
        notifyCatalogChanged();
        fetchAdminData(true);
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
      setProducts((prev) => {
        const next = prev.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            ...updatedFields,
            updatedAt: new Date().toISOString(),
          };
        });
        try { localStorage.setItem('curator_cached_products', JSON.stringify(next)); } catch {}
        return next;
      });

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
        setProducts((prev) => {
          const next = prev.map((p) => (p.id === id ? { ...p, ...res.product } : p));
          try { localStorage.setItem('curator_cached_products', JSON.stringify(next)); } catch {}
          return next;
        });
        notifyCatalogChanged();
        fetchAdminData(true);
        return { success: true, product: res.product };
      }
      return { success: false, error: 'Failed to update product' };
    } catch (err) {
      // On failure, rollback by refreshing
      await fetchAdminData(true);
      return { success: false, error: err.message || 'Error updating product' };
    }
  };

  const deleteProduct = async (id) => {
    try {
      // Optimistic delete (0ms)
      setProducts((prev) => {
        const next = prev.filter((p) => p.id !== id);
        try { localStorage.setItem('curator_cached_products', JSON.stringify(next)); } catch {}
        return next;
      });
      await api.deleteProduct(id);
      notifyCatalogChanged();
      fetchAdminData(true);
      return { success: true };
    } catch (err) {
      await fetchAdminData(true);
      return { success: false, error: err.message || 'Error deleting product' };
    }
  };

  const toggleProductStatus = async (id, overrideStatus) => {
    try {
      const target = products.find((p) => p.id === id);
      const newStatus = overrideStatus || (target?.status === 'published' ? 'draft' : 'published');
      // Optimistic toggle (0ms)
      setProducts((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p));
        try { localStorage.setItem('curator_cached_products', JSON.stringify(next)); } catch {}
        return next;
      });
      const res = await api.togglePublish(id, newStatus);
      if (res.product) {
        setProducts((prev) => {
          const next = prev.map((p) => (p.id === id ? { ...p, ...res.product } : p));
          try { localStorage.setItem('curator_cached_products', JSON.stringify(next)); } catch {}
          return next;
        });
        notifyCatalogChanged();
        fetchAdminData(true);
        return { success: true, product: res.product };
      }
      return { success: false };
    } catch (err) {
      await fetchAdminData(true);
      return { success: false, error: err.message };
    }
  };

  const toggleProductFeatured = async (id) => {
    try {
      const target = products.find((p) => p.id === id);
      const nextFeatured = !target?.isFeatured;
      // Optimistic toggle (0ms)
      setProducts((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, isFeatured: nextFeatured } : p));
        try { localStorage.setItem('curator_cached_products', JSON.stringify(next)); } catch {}
        return next;
      });
      const res = await api.updateProduct(id, { isFeatured: nextFeatured });
      if (res.product) {
        setProducts((prev) => {
          const next = prev.map((p) => (p.id === id ? { ...p, ...res.product } : p));
          try { localStorage.setItem('curator_cached_products', JSON.stringify(next)); } catch {}
          return next;
        });
        notifyCatalogChanged();
        fetchAdminData(true);
        return { success: true, product: res.product };
      }
      return { success: false };
    } catch (err) {
      await fetchAdminData(true);
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
        await fetchAdminData(true);
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
        await fetchAdminData(true);
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
      await fetchAdminData(true);
      notifyCatalogChanged();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Error deleting category' };
    }
  };

  const deleteCategoryWithReassignment = async (categoryIdToDelete, reassignToCategoryId) => {
    try {
      await api.deleteCategory(categoryIdToDelete, reassignToCategoryId);
      await fetchAdminData(true);
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
    await fetchAdminData(true);
    notifyCatalogChanged();
  };

  const updateSettings = async (newSettings) => {
    // 1. Instant optimistic update in React state
    setSettings((prev) => {
      const next = { ...prev, ...newSettings };
      try { localStorage.setItem('curator_cached_settings', JSON.stringify(next)); } catch {}
      return next;
    });
    try {
      // 2. Persist to Express backend and data/settings.json
      const res = await api.updateSettings(newSettings);
      if (res?.settings) {
        setSettings((prev) => {
          const next = { ...prev, ...res.settings };
          try { localStorage.setItem('curator_cached_settings', JSON.stringify(next)); } catch {}
          return next;
        });
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

  const refreshCatalog = useCallback(async () => {
    if (adminUser) {
      return await fetchAdminData(false, true);
    }
    return await fetchPublicData(false, true);
  }, [adminUser, fetchAdminData, fetchPublicData]);

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
    updateAdminCredentials,
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
    refreshCatalog,
    syncLatestCatalog,
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
