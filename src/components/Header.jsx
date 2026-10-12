import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

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

  const handleNavClick = (nav) => {
    setActiveNav(nav);
    setMobileMenuOpen(false);
    if (nav === 'about') onOpenAbout();
    if (nav === 'contact') onOpenContact();
  };

  return (
    <header className="w-full pt-8 pb-6 px-6 sm:px-10 lg:px-14 flex items-center justify-between text-neutral-900 border-b border-neutral-900/[0.06]">
      {/* Brand Wordmark (Left) */}
      <div className="flex-1 flex items-center">
        <button
          onClick={() => handleNavClick('shop')}
          className="text-base sm:text-lg font-extrabold tracking-[0.18em] uppercase text-neutral-900 hover:opacity-80 transition-opacity flex items-center space-x-2"
        >
          <span>TECHNICALSKY</span>
        </button>
      </div>

      {/* Center Navigation Links (Shop, About, Contact) */}
      <nav className="hidden md:flex items-center space-x-10 text-sm font-normal tracking-tight text-neutral-800">
        <button
          onClick={() => handleNavClick('shop')}
          className={`transition-all duration-200 pb-1 border-b-[1.5px] ${
            activeNav === 'shop'
              ? 'text-neutral-900 font-semibold border-neutral-900'
              : 'text-neutral-500 hover:text-neutral-900 border-transparent hover:border-neutral-300'
          }`}
        >
          Shop
        </button>
        <button
          onClick={() => handleNavClick('about')}
          className={`transition-all duration-200 pb-1 border-b-[1.5px] ${
            activeNav === 'about'
              ? 'text-neutral-900 font-semibold border-neutral-900'
              : 'text-neutral-500 hover:text-neutral-900 border-transparent'
          }`}
        >
          About
        </button>
        <button
          onClick={() => handleNavClick('contact')}
          className={`transition-all duration-200 pb-1 border-b-[1.5px] ${
            activeNav === 'contact'
              ? 'text-neutral-900 font-semibold border-neutral-900'
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
          className="md:hidden p-1.5 text-neutral-800 hover:text-neutral-900"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-6 right-6 bg-[#F6F4FA] rounded-2xl shadow-xl p-6 z-50 md:hidden flex flex-col space-y-4 border border-neutral-200/60">
          <button
            onClick={() => handleNavClick('shop')}
            className="text-left text-base font-medium text-neutral-900 py-1"
          >
            Shop
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="text-left text-base font-medium text-neutral-700 hover:text-neutral-900 py-1"
          >
            About
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className="text-left text-base font-medium text-neutral-700 hover:text-neutral-900 py-1"
          >
            Contact
          </button>
        </div>
      )}
    </header>
  );
}

