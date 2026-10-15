import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import AboutModal from './components/AboutModal';
import ContactModal from './components/ContactModal';
import AdminLayout from './admin/AdminLayout';
import { useStore } from './context/StoreContext';

function getInitialPath() {
  if (typeof window === 'undefined') return '/';
  const path = window.location.pathname;
  if (path === '/admin' || path.startsWith('/admin/')) return '/admin';
  if (
    window.location.hash === '#/admin' ||
    window.location.hash.startsWith('#/admin') ||
    window.location.hash === '#admin' ||
    window.location.hash.startsWith('#admin')
  ) {
    return '/admin';
  }
  if (window.location.search.includes('admin=true')) return '/admin';
  return '/';
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(getInitialPath);
  const [activeNav, setActiveNav] = useState('shop');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const productGridRef = useRef(null);
  const { publicProducts, refreshCatalog } = useStore();

  // Keep route synced with browser history & address bar
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getInitialPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    setCurrentRoute(path);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    if (path === '/') {
      refreshCatalog?.();
    }
  };

  // Route: Admin Console
  if (currentRoute === '/admin') {
    return <AdminLayout onNavigateToStorefront={() => navigate('/')} />;
  }

  // Route: Public Storefront (Full-width 4-column modern card grid)
  return (
    <div className="min-h-screen bg-[#DFDAEB] p-2.5 sm:p-4 md:p-6 lg:p-7 flex flex-col justify-start">
      {/* Outer Page Frame with Rounded Outer Corners, Soft Lavender Background */}
      <div className="w-full max-w-[1680px] mx-auto min-h-screen md:min-h-0 md:h-[calc(100vh-32px)] lg:h-[calc(100vh-48px)] rounded-[24px] sm:rounded-[32px] md:rounded-[40px] overflow-hidden flex flex-col relative shadow-sm border border-black/[0.03] canvas-bg">
        
        {/* Top Navigation Header */}
        <Header
          onOpenAbout={() => setIsAboutOpen(true)}
          onOpenContact={() => setIsContactOpen(true)}
          activeNav={activeNav}
          setActiveNav={setActiveNav}
        />

        {/* Body: Full-Width Product Catalogue (3-Column Mobile, 4-Column Desktop) */}
        <main className="flex-1 min-h-0 px-3 sm:px-8 lg:px-12 pt-4 sm:pt-7 pb-4 flex flex-col md:overflow-hidden">
          {/* Subtle minimal collection header */}
          <div className="flex items-baseline justify-between mb-3.5 sm:mb-6 shrink-0 px-1">
            <div className="flex items-baseline space-x-2.5 sm:space-x-3">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-neutral-900 tracking-tight font-normal">
                / Shop
              </h1>
              <span className="text-[11px] sm:text-xs text-neutral-400 font-normal">
                {publicProducts.length} curated {publicProducts.length === 1 ? 'piece' : 'pieces'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-normal hidden sm:block">
              Direct affiliate discoveries. Click any piece to purchase instantly.
            </p>
          </div>

          {/* Product Catalogue: Full-width 4-Card Responsive Grid */}
          <section
            ref={productGridRef}
            className="flex-1 w-full min-w-0 md:h-full md:overflow-y-auto pr-1 md:pr-2.5 pb-20 custom-scroll focus:outline-none"
            aria-label="Curated Product Grid"
            tabIndex={0}
          >
            <ProductGrid products={publicProducts} />
          </section>
        </main>
      </div>

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}
