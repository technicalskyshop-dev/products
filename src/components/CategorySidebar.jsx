import React from 'react';

export default function CategorySidebar({ productCount = 0 }) {
  return (
    <aside className="w-full select-none">
      <p className="text-xs text-neutral-400 font-normal leading-relaxed hidden md:block">
        Direct affiliate discoveries. Click any item to purchase instantly on Amazon or Flipkart.
      </p>
    </aside>
  );
}

