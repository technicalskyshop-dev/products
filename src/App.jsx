import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import AboutModal from './components/AboutModal';
import ContactModal from './components/ContactModal';
import AdminLayout from './admin/AdminLayout';
import { useStore } from './context/StoreContext';
import { resolveTheme } from './data/themes';

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
  const { publicProducts, refreshCatalog, settings } = useStore();

  const theme = resolveTheme(settings);
  const isDark = theme.isDark;

  const glassCanvasClass = isDark ? 'glass-canvas-dark' : 'glass-canvas';
  const opacityClass =
    theme.glassOpacity === 'subtle'
      ? 'glass-opacity-subtle'
      : theme.glassOpacity === 'heavy'
      ? 'glass-opacity-heavy'
      : '';
  const blurClass =
    theme.glassBlur === 'low'
      ? 'glass-blur-low'
      : theme.glassBlur === 'high'
      ? 'glass-blur-high'
      : '';

  // Keep route synced with browser history & address bar
  useEffect(() => {
    const handlePopState = () => {
      const nextRoute = getInitialPath();
      setCurrentRoute(nextRoute);
      if (nextRoute === '/') {
        refreshCatalog?.();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [refreshCatalog]);

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
    <>
      <style>{`
        .active-theme-bg {
          background-color: ${isDark ? '#0f172a' : '#ECEEF2'};
          ${theme.desktopBg ? `background-image: url('${theme.desktopBg}');` : ''}
          background-size: cover;
          background-position: top center;
          background-attachment: fixed;
          background-repeat: no-repeat;
        }
        @media (max-width: 768px) {
          .active-theme-bg {
            ${theme.mobileBg || theme.desktopBg ? `background-image: url('${theme.mobileBg || theme.desktopBg}');` : ''}
            background-attachment: scroll;
          }
        }
      `}</style>

      <div
        className={`min-h-screen active-theme-bg p-2.5 sm:p-4 md:p-6 lg:p-7 flex flex-col justify-start transition-colors duration-300 ${
          isDark ? 'selection:bg-white selection:text-black' : 'selection:bg-neutral-900 selection:text-white'
        }`}
      >
        {/* Front Frosted Glass Panel (Liquid Glassmorphism) */}
        <div
          className={`w-full max-w-[1680px] mx-auto min-h-screen md:min-h-0 md:h-[calc(100vh-32px)] lg:h-[calc(100vh-48px)] rounded-[24px] sm:rounded-[32px] md:rounded-[40px] overflow-hidden flex flex-col relative transition-all duration-300 ${glassCanvasClass} ${opacityClass} ${blurClass}`}
        >
          {/* Subtle Specular Top Glass Highlight */}
          <div
            className={`absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${
              isDark ? 'from-white/10 via-white/5' : 'from-white/60 via-white/20'
            } to-transparent pointer-events-none rounded-t-[24px] sm:rounded-t-[32px] md:rounded-t-[40px]`}
          />
          
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
                <h1
                  className={`font-serif text-2xl sm:text-3xl md:text-4xl tracking-tight font-normal ${
                    isDark ? 'text-white' : 'text-neutral-900'
                  }`}
                >
                  / Shop
                </h1>
                <span className="text-[11px] sm:text-xs text-neutral-400 font-normal">
                  {publicProducts.length} curated {publicProducts.length === 1 ? 'piece' : 'pieces'}
                </span>
              </div>
              <p className={`text-xs font-normal hidden sm:block ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
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
    </>
  );
}
