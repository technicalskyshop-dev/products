import React from 'react';
import {
  Package,
  CheckCircle,
  Clock,
  Sparkles,
  Plus,
  ArrowRight,
  ExternalLink,
  Store,
  Compass,
  ArrowUpRight,
} from 'lucide-react';

export default function DashboardOverview({
  products = [],
  onNavigate, // function to change active admin tab ('products', 'settings')
  onOpenAddProduct,
  onOpenStorefront,
}) {
  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.status === 'published').length;
  const draftProducts = products.filter((p) => p.status === 'draft').length;
  const featuredProducts = products.filter((p) => p.isFeatured).length;

  // Affiliate store routing analytics
  const dualStoreCount = products.filter(
    (p) => Boolean(p.amazonUrl && p.amazonUrl.trim()) && Boolean(p.flipkartUrl && p.flipkartUrl.trim())
  ).length;

  const amazonOnlyCount = products.filter(
    (p) => Boolean(p.amazonUrl && p.amazonUrl.trim()) && !Boolean(p.flipkartUrl && p.flipkartUrl.trim())
  ).length;

  const flipkartOnlyCount = products.filter(
    (p) => !Boolean(p.amazonUrl && p.amazonUrl.trim()) && Boolean(p.flipkartUrl && p.flipkartUrl.trim())
  ).length;

  // Total recorded clicks across products
  const totalClicks = products.reduce((acc, p) => acc + (p.clickCount || 0), 0);

  // Recent 5 products sorted by updatedAt descending
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 5);

  const routingStats = [
    {
      label: 'Dual Stores (Chooser Modal)',
      sub: 'Both Amazon & Flipkart configured',
      count: dualStoreCount,
      color: 'bg-purple-600',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      label: 'Amazon Exclusive (Direct 1-Click)',
      sub: 'Single-click redirect to Amazon',
      count: amazonOnlyCount,
      color: 'bg-neutral-900',
      badgeClass: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    },
    {
      label: 'Flipkart Exclusive (Direct 1-Click)',
      sub: 'Single-click redirect to Flipkart',
      count: flipkartOnlyCount,
      color: 'bg-[#2874F0]',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Storefront Telemetry
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Cloud database catalog overview and partner store routing telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenStorefront}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-sm"
          >
            <Store size={14} />
            <span>View 4-Card Store</span>
          </button>

          <button
            onClick={onOpenAddProduct}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-neutral-900 hover:bg-black transition-colors shadow-sm"
          >
            <Plus size={14} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Total Catalog
            </span>
            <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
              <Package size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-neutral-900">{totalProducts}</div>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">Supabase cloud items</span>
          </div>
        </div>

        {/* Published */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Live in Store
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-neutral-900">{publishedProducts}</div>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
              Active on 4-card grid
            </span>
          </div>
        </div>

        {/* Drafts */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Curator Drafts
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-neutral-900">{draftProducts}</div>
            <span className="text-[11px] text-amber-600 font-medium mt-0.5 block">
              Unpublished drafts
            </span>
          </div>
        </div>

        {/* Dual-Listed (Chooser) */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
              Dual Stores
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Compass size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-neutral-900">{dualStoreCount}</div>
            <span className="text-[11px] text-purple-600 font-medium mt-0.5 block">
              Chooser modal enabled
            </span>
          </div>
        </div>

        {/* Featured */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-600">
              Featured
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-neutral-900">{featuredProducts}</div>
            <span className="text-[11px] text-violet-600 font-medium mt-0.5 block">
              Top curated picks
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Activity + Partner Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Recent Product Updates */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Recent Products & Routing</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Latest catalogue specimens with live redirection mode
              </p>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-semibold text-neutral-700 hover:text-black flex items-center space-x-1"
            >
              <span>Manage all products</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="divide-y divide-neutral-100 flex-1">
            {recentProducts.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-xs">
                No products found in database.
              </div>
            ) : (
              recentProducts.map((p) => {
                const hasAmz = Boolean(p.amazonUrl && p.amazonUrl.trim());
                const hasFk = Boolean(p.flipkartUrl && p.flipkartUrl.trim());

                return (
                  <div
                    key={p.id}
                    className="p-4 flex items-center justify-between hover:bg-neutral-50/70 transition-colors group"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0 pr-4">
                      <div className="w-12 h-12 rounded-xl bg-[#F5F2F9] p-1.5 shrink-0 flex items-center justify-center overflow-hidden border border-neutral-100">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-neutral-900 block truncate text-xs sm:text-sm">
                          {p.name}
                        </span>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[11px] font-medium text-neutral-700">
                            {p.displayPrice}
                          </span>
                          <span className="text-[11px] text-neutral-400">·</span>
                          {hasAmz && hasFk ? (
                            <span className="text-[10.5px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                              Both Stores
                            </span>
                          ) : hasAmz ? (
                            <span className="text-[10.5px] font-semibold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md">
                              Amazon Only
                            </span>
                          ) : hasFk ? (
                            <span className="text-[10.5px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                              Flipkart Only
                            </span>
                          ) : (
                            <span className="text-[10.5px] text-neutral-400">No Link</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span
                        className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          p.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {p.status}
                      </span>

                      <button
                        onClick={() => onNavigate('products')}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                        title="Edit product"
                      >
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right (1 col): Partner Store Distribution */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">Partner Store Distribution</h3>
              <span className="text-xs font-semibold text-neutral-400">
                {totalProducts} Total
              </span>
            </div>

            <div className="space-y-4 mt-5">
              {routingStats.map((item) => {
                const percent =
                  totalProducts > 0 ? Math.round((item.count / totalProducts) * 100) : 0;

                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-neutral-800 block">
                          {item.label}
                        </span>
                        <span className="text-[10.5px] text-neutral-400">{item.sub}</span>
                      </div>
                      <span className="font-semibold text-neutral-900 ml-2">
                        {item.count} ({percent}%)
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-300`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 mt-6 flex justify-between items-center text-xs">
            <span className="text-neutral-500">Need to list a new item?</span>
            <button
              onClick={onOpenAddProduct}
              className="font-semibold text-neutral-900 hover:underline"
            >
              + Add Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
