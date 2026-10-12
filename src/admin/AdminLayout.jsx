import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Settings,
  Store,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  LogOut,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import DashboardOverview from './DashboardOverview';
import ProductManagement from './ProductManagement';
import CategoryManagement from './CategoryManagement';
import SettingsView from './SettingsView';
import ToastNotification from './ToastNotification';
import AdminLoginForm from './AdminLoginForm';
import { useStore } from '../context/StoreContext';

export default function AdminLayout({ onNavigateToStorefront }) {
  const store = useStore();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'categories' | 'settings'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ts_sidebar_collapsed');
      if (saved !== null) return saved === 'true';
    }
    return false;
  });
  const [toast, setToast] = useState(null);
  const [isAddModalTriggered, setIsAddModalTriggered] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('ts_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  const showToast = ({ title, message, type = 'success' }) => {
    setToast({ title, message, type });
  };

  // Auth Checking State
  if (store.isAuthChecking) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <div className="flex items-center space-x-3 text-sm text-neutral-400">
          <Loader2 size={18} className="animate-spin text-white" />
          <span>Verifying administrator session...</span>
        </div>
      </div>
    );
  }

  // Enforce Real Server-Side Authentication Guard
  if (!store.isAuthenticated) {
    return (
      <AdminLoginForm
        onLogin={store.login}
        onNavigateToStorefront={onNavigateToStorefront}
      />
    );
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, count: store.products.length },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMobileSidebarOpen(false);
  };

  const handleOpenAddProductFromOverview = () => {
    setActiveTab('products');
    setIsAddModalTriggered(true);
  };

  return (
    <div className="h-screen w-screen bg-slate-100 flex flex-row text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white antialiased overflow-hidden">
      {/* Admin Sidebar (Permanently Fixed in Place) */}
      <aside
        className={`h-screen bg-neutral-950 text-neutral-300 flex flex-col justify-between shrink-0 transition-all duration-200 z-30 select-none overflow-y-auto ${
          isSidebarCollapsed ? 'w-16 p-2 sm:p-2.5' : 'w-56 sm:w-60 p-4 sm:p-5'
        }`}
      >
        <div>
          {/* Brand & Toggle Header */}
          <div className="pb-4 border-b border-white/10 flex items-center justify-between">
            {!isSidebarCollapsed ? (
              <>
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-white text-neutral-950 font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                    TS
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
                      {store.settings?.storeName || 'TechnicalSky'}
                    </h1>
                    <span className="text-[10px] text-neutral-400 font-medium block truncate">
                      Console
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Collapse sidebar into slim icon bar"
                  >
                    <PanelLeftClose size={16} />
                  </button>
                </div>
              </>
            ) : (
              /* Collapsed Slim Header */
              <div className="w-full flex flex-col items-center space-y-2">
                <div
                  className="w-10 h-10 rounded-xl bg-white text-neutral-950 font-black text-xs flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-transform"
                  onClick={toggleSidebar}
                  title="TechnicalSky (Click to expand sidebar)"
                >
                  TS
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Expand sidebar"
                >
                  <PanelLeftOpen size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 space-y-1.5" aria-label="Admin navigation tabs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              if (isSidebarCollapsed) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`relative w-11 h-11 mx-auto flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-neutral-950 shadow-sm'
                        : 'text-neutral-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={`${item.label} ${item.count !== undefined ? `(${item.count})` : ''}`}
                  >
                    <Icon size={18} />
                    {item.count !== undefined && (
                      <span
                        className={`absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs ${
                          isActive ? 'bg-neutral-950 text-white' : 'bg-purple-600 text-white'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-neutral-950 text-white' : 'bg-white/10 text-neutral-300'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar Actions */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          {isSidebarCollapsed ? (
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={onNavigateToStorefront}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Return to Storefront"
              >
                <Store size={16} />
              </button>

              <button
                onClick={store.logout}
                className="w-10 h-10 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>

              <div
                className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] mt-0.5"
                title="Database Connected"
              />
            </div>
          ) : (
            <>
              <button
                onClick={onNavigateToStorefront}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 bg-white/5 hover:bg-white/10 hover:text-white transition-all border border-white/5 group cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Store size={15} className="group-hover:scale-105 transition-transform" />
                  <span>Return to Storefront</span>
                </div>
                <ExternalLink size={12} className="text-neutral-500 group-hover:text-white transition-colors" />
              </button>

              <button
                onClick={store.logout}
                className="w-full flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span className="truncate">Sign Out ({store.adminUser?.email?.split('@')[0]})</span>
              </button>

              <div className="flex items-center space-x-2 px-1 text-[11px] text-neutral-500 pt-1">
                <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                <span className="truncate">Database · Connected</span>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main Content Area (Independently Scrollable Right Pane) */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden bg-slate-100">
        {/* Top Header Bar with Sidebar Toggle (Pinned at Top of Right Pane) */}
        <header className="bg-white border-b border-neutral-200/80 px-4 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between shrink-0 shadow-xs z-10">
          <div className="flex items-center space-x-2 text-xs font-medium text-neutral-500 min-w-0">
            {/* Top Bar Sidebar Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="p-1.5 -ml-1 sm:-ml-2 mr-1 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer flex items-center shrink-0"
              title={isSidebarCollapsed ? 'Expand sidebar (Full view)' : 'Collapse sidebar (Slim icon view)'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen size={16} className="text-neutral-700" />
              ) : (
                <PanelLeftClose size={16} className="text-neutral-700" />
              )}
            </button>

            <span className="hidden sm:inline">Admin</span>
            <ChevronRight size={14} className="text-neutral-400 hidden sm:inline" />
            <span className="text-neutral-900 font-semibold capitalize truncate">{activeTab}</span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 sm:px-2.5 py-1 rounded-full whitespace-nowrap">
              ● Live Sync
            </span>

            <span className="hidden md:inline text-xs font-medium text-neutral-600 bg-neutral-100 px-3 py-1 rounded-lg truncate max-w-[180px]">
              {store.adminUser?.email}
            </span>

            <button
              onClick={onNavigateToStorefront}
              className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200/70 transition-colors cursor-pointer"
            >
              <Store size={13} />
              <span className="hidden sm:inline">Storefront</span>
            </button>

            <button
              onClick={store.logout}
              className="inline-flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Tab View Container - Independently Scrollable */}
        <main className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-8 w-full custom-scroll overscroll-contain">
          <div className="max-w-7xl w-full mx-auto pb-12">
            {activeTab === 'overview' && (
              <DashboardOverview
                products={store.products}
                categories={store.categories}
                onNavigate={(tab) => setActiveTab(tab)}
                onOpenAddProduct={handleOpenAddProductFromOverview}
                onOpenStorefront={onNavigateToStorefront}
              />
            )}

            {activeTab === 'products' && (
              <ProductManagement
                products={store.products}
                categories={store.categories}
                onAddProduct={store.addProduct}
                onUpdateProduct={store.updateProduct}
                onDeleteProduct={store.deleteProduct}
                onToggleStatus={store.toggleProductStatus}
                onToggleFeatured={store.toggleProductFeatured}
                showToast={showToast}
                isAddModalOpenInitially={isAddModalTriggered}
                onCloseAddModalInitially={() => setIsAddModalTriggered(false)}
              />
            )}

            {activeTab === 'categories' && (
              <CategoryManagement
                categories={store.categories}
                products={store.products}
                onAddCategory={store.addCategory}
                onUpdateCategory={store.updateCategory}
                onDeleteCategory={store.deleteCategory}
                onDeleteWithReassignment={store.deleteCategoryWithReassignment}
                onToggleEnabled={store.toggleCategoryEnabled}
                onReorderCategories={store.reorderCategories}
                showToast={showToast}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                settings={store.settings}
                onUpdateSettings={store.updateSettings}
                onResetToDefaults={store.resetToDefaults}
                onExportCatalog={store.exportCatalogJson}
                showToast={showToast}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

