import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { resolveTheme } from '../data/themes';

export default function Header({
  onOpenAbout,
  onOpenContact,
  onOpenAccount,
  onOpenCart,
  cartCount = 0,
  activeNav,
  setActiveNav,
  onNavigateToAdmin,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings } = useStore();
  const theme = resolveTheme(settings);
  const isDark = theme.isDark;
  const wordmark = settings?.brandWordmark || 'TECHNICALSKY';

  const handleNavClick = (nav) => {
    setActiveNav(nav);
    setMobileMenuOpen(false);
    if (nav === 'about') onOpenAbout();
    if (nav === 'contact') onOpenContact();
  };

  return (
    <header
      className={`w-full pt-8 pb-6 px-6 sm:px-10 lg:px-14 flex items-center justify-between border-b transition-colors ${
        isDark ? 'text-white border-white/10' : 'text-neutral-900 border-neutral-900/[0.06]'
      }`}
    >
      {/* Brand Logo & Wordmark (Left) */}
      <div className="flex-1 flex items-center">
        <button
          onClick={() => handleNavClick('shop')}
          className="group flex items-center space-x-2.5 sm:space-x-3 text-current hover:opacity-90 transition-all cursor-pointer select-none"
        >
          <img
            src="/logo.png"
            alt="TechnicalSky"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shadow-sm ring-1 ring-black/10 group-hover:scale-105 transition-transform shrink-0"
          />
          <span className="text-base sm:text-lg font-extrabold tracking-[0.18em] uppercase leading-none text-current">
            {wordmark}
          </span>
        </button>
      </div>

      {/* Center Navigation Links (Shop, About, Contact) */}
      <nav
        className={`hidden md:flex items-center space-x-10 text-sm font-normal tracking-tight ${
          isDark ? 'text-neutral-300' : 'text-neutral-800'
        }`}
      >
        <button
          onClick={() => handleNavClick('shop')}
          className={`transition-all duration-200 pb-1 border-b-[1.5px] ${
            activeNav === 'shop'
              ? isDark
                ? 'text-white font-semibold border-white'
                : 'text-neutral-900 font-semibold border-neutral-900'
              : isDark
              ? 'text-neutral-400 hover:text-white border-transparent hover:border-white/20'
              : 'text-neutral-500 hover:text-neutral-900 border-transparent hover:border-neutral-300'
          }`}
        >
          Shop
        </button>
        <button
          onClick={() => handleNavClick('about')}
          className={`transition-all duration-200 pb-1 border-b-[1.5px] ${
            activeNav === 'about'
              ? isDark
                ? 'text-white font-semibold border-white'
                : 'text-neutral-900 font-semibold border-neutral-900'
              : isDark
              ? 'text-neutral-400 hover:text-white border-transparent'
              : 'text-neutral-500 hover:text-neutral-900 border-transparent'
          }`}
        >
          About
        </button>
        <button
          onClick={() => handleNavClick('contact')}
          className={`transition-all duration-200 pb-1 border-b-[1.5px] ${
            activeNav === 'contact'
              ? isDark
                ? 'text-white font-semibold border-white'
                : 'text-neutral-900 font-semibold border-neutral-900'
              : isDark
              ? 'text-neutral-400 hover:text-white border-transparent'
              : 'text-neutral-500 hover:text-neutral-900 border-transparent'
          }`}
        >
          Contact
        </button>
      </nav>

      {/* Right Spacer (Keeps center navigation links perfectly centered) */}
      <div className="flex-1 flex items-center justify-end">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`md:hidden p-1.5 transition-colors ${
            isDark ? 'text-white hover:text-neutral-300' : 'text-neutral-800 hover:text-neutral-900'
          }`}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className={`absolute top-20 left-6 right-6 rounded-2xl shadow-xl p-6 z-50 md:hidden flex flex-col space-y-4 border ${
            isDark
              ? 'bg-neutral-900/95 backdrop-blur-xl border-white/15 text-white'
              : 'bg-[#F6F4FA] border-neutral-200/60 text-neutral-900'
          }`}
        >
          <button
            onClick={() => handleNavClick('shop')}
            className={`text-left text-base font-medium py-1 ${
              isDark ? 'text-white' : 'text-neutral-900'
            }`}
          >
            Shop
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className={`text-left text-base font-medium py-1 ${
              isDark ? 'text-neutral-300 hover:text-white' : 'text-neutral-700 hover:text-neutral-900'
            }`}
          >
            About
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className={`text-left text-base font-medium py-1 ${
              isDark ? 'text-neutral-300 hover:text-white' : 'text-neutral-700 hover:text-neutral-900'
            }`}
          >
            Contact
          </button>
        </div>
      )}
    </header>
  );
}

