import React, { useRef, useEffect } from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products = [] }) {
  const hasMountedRef = useRef(false);

  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  if (!products || products.length === 0) {
    return (
      <div className="w-full py-28 flex flex-col items-center justify-center text-center">
        <span className="text-4xl text-neutral-300 mb-3">✦</span>
        <p className="text-sm font-medium text-neutral-600">
          No products currently available.
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          Add new products in the Admin Panel to populate the collection.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 
        Responsive Grid:
        - Mobile (< md): 3 Columns (sillycorns.shop layout) with compact gaps
        - Tablet (md): 3 Columns
        - Desktop (lg & xl): 4 Columns (luxury Dribbble card layout)
      */}
      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-5 lg:gap-6 xl:gap-7 items-start pb-16">
        {products.map((product, idx) => (
          <div
            key={product.id}
            className={hasMountedRef.current ? '' : 'animate-fade-in-up'}
            style={hasMountedRef.current ? undefined : { animationDelay: `${(idx % 12) * 35}ms` }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
