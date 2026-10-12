import React from 'react';

export default function CategorySidebar({ productCount = 0 }) {
  return (
    <aside className="w-full select-none">
      {/* Large Black Serif "/ Shop" Heading */}
      <div className="mb-4 md:mb-6">
        <h1 className="font-serif text-5xl lg:text-[58px] text-neutral-900 tracking-tight font-normal leading-none">
          / Shop
        </h1>
      </div>
      <p className="text-xs text-neutral-400 font-normal leading-relaxed hidden md:block">
        Direct affiliate discoveries. Click any item to purchase instantly on Amazon or Flipkart.
      </p>
    </aside>
  );
}

