import React, { useState, useEffect, useRef } from 'react';
import {
  Palette,
  Image as ImageIcon,
  Sun,
  Moon,
  Upload,
  Check,
  Sparkles,
  Eye,
  Sliders,
  RefreshCw,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Monitor,
  Zap,
} from 'lucide-react';
import { PRESET_THEMES } from '../data/themes';
import { api } from '../api/client';

export default function AppearanceView({
  settings,
  onUpdateSettings,
  onSyncSettings,
  showToast,
  onNavigateToStorefront,
}) {
  // Single source of truth for active theme directly from store settings
  const activeTheme = settings?.activeTheme || 'offwhite-grid';

  const [customBgUrl, setCustomBgUrl] = useState(settings?.customBgUrl || '');
  const [customBgMobileUrl, setCustomBgMobileUrl] = useState(settings?.customBgMobileUrl || '');
  const [themeMode, setThemeMode] = useState(settings?.themeMode || 'light');
  const [glassBlur, setGlassBlur] = useState(settings?.glassBlur || 'medium');
  const [glassOpacity, setGlassOpacity] = useState(settings?.glassOpacity || 'medium');

  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'light' | 'dark' | 'custom'
  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);
  const [isApplyingThemeId, setIsApplyingThemeId] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'

  const activationInProgressRef = useRef(false);
  const desktopFileInputRef = useRef(null);
  const mobileFileInputRef = useRef(null);

  // Sync editable input state when settings prop changes from backend
  useEffect(() => {
    if (settings) {
      setCustomBgUrl(settings.customBgUrl || '');
      setCustomBgMobileUrl(settings.customBgMobileUrl || '');
      setThemeMode(settings.themeMode || 'light');
      setGlassBlur(settings.glassBlur || 'medium');
      setGlassOpacity(settings.glassOpacity || 'medium');
    }
  }, [settings]);

  // On page load and refresh, fetch the active theme from the backend instead of relying on stale local state
  useEffect(() => {
    let isMounted = true;
    async function fetchBackendThemeSettings() {
      try {
        const res = await api.getAdminSettings().catch(() => api.getSettings());
        if (isMounted && res?.settings) {
          if (activationInProgressRef.current) return;
          onSyncSettings?.(res.settings);
          setCustomBgUrl(res.settings.customBgUrl || '');
          setCustomBgMobileUrl(res.settings.customBgMobileUrl || '');
          setThemeMode(res.settings.themeMode || 'light');
          setGlassBlur(res.settings.glassBlur || 'medium');
          setGlassOpacity(res.settings.glassOpacity || 'medium');
        }
      } catch (err) {
        console.warn('Could not fetch fresh active theme on load:', err);
      }
    }

    fetchBackendThemeSettings();
    return () => {
      isMounted = false;
    };
  }, [onSyncSettings]);

  // 1-Click Activate Theme with Single Source of Truth & Zero-Overlap Protection
  const handleActivateTheme = async (themeId, overrideMode = null) => {
    // 1. Prevent duplicate or overlapping activation requests while one is in progress
    if (activationInProgressRef.current || isApplyingThemeId) {
      return;
    }

    // If theme is already active and no mode override, no-op
    if (themeId === activeTheme && !overrideMode) {
      return;
    }

    activationInProgressRef.current = true;
    setIsApplyingThemeId(themeId);

    const preset = PRESET_THEMES.find((p) => p.id === themeId);
    const effectiveMode = overrideMode || (preset && preset.mode !== 'custom' ? preset.mode : themeMode);

    try {
      const payload = {
        activeTheme: themeId,
        themeMode: effectiveMode,
        glassBlur,
        glassOpacity,
        customBgUrl: (customBgUrl || '').trim(),
        customBgMobileUrl: (customBgMobileUrl || '').trim(),
      };

      // 2. Call backend - UI will update ONLY after server confirms success
      const res = await onUpdateSettings?.(payload);
      if (res?.success) {
        if (preset && preset.mode !== 'custom') {
          setThemeMode(preset.mode);
        }
        showToast?.({
          title: 'Theme Activated Live!',
          message: `"${preset?.name || 'Theme'}" is now live on technicalskystuff.com`,
          type: 'success',
        });
      } else {
        throw new Error(res?.error || 'Could not save theme');
      }
    } catch (err) {
      console.error('Failed to activate theme:', err);
      // 3. If activation fails, keep previous theme active and show error
      showToast?.({
        title: 'Theme Activation Failed',
        message: err.message || 'Please check your connection and try again',
        type: 'error',
      });
    } finally {
      setIsApplyingThemeId(null);
      activationInProgressRef.current = false;
    }
  };

  // Upload handler for custom background
  const handleFileUpload = async (file, isMobile = false) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast?.({
        title: 'Invalid File',
        message: 'Please upload a valid image file (JPG, PNG, WebP).',
        type: 'error',
      });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast?.({
        title: 'File Too Large',
        message: 'Image size exceeds 15MB limit.',
        type: 'error',
      });
      return;
    }

    const setUploading = isMobile ? setIsUploadingMobile : setIsUploadingDesktop;
    setUploading(true);

    try {
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await api.uploadImage(base64Data, file.name);
      const url = res?.imageUrl || res?.url;

      if (!url) {
        throw new Error('Image URL was not returned by server');
      }

      if (isMobile) {
        setCustomBgMobileUrl(url);
      } else {
        setCustomBgUrl(url);
      }

      // Auto-save the uploaded wallpaper to settings
      const payload = {
        activeTheme: 'custom',
        customBgUrl: isMobile ? customBgUrl : url,
        customBgMobileUrl: isMobile ? url : customBgMobileUrl,
        themeMode,
        glassBlur,
        glassOpacity,
      };
      await onUpdateSettings?.(payload);

      showToast?.({
        title: 'Wallpaper Uploaded & Activated!',
        message: `${isMobile ? 'Mobile' : 'Desktop'} background is now active on your storefront!`,
        type: 'success',
      });
    } catch (err) {
      console.error('Background upload error:', err);
      showToast?.({
        title: 'Upload Failed',
        message: 'Could not upload image. Please try again or paste image URL.',
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  // Save changes to custom configuration or glass sliders
  const handleSaveCustomConfig = async () => {
    try {
      const payload = {
        activeTheme,
        customBgUrl: (customBgUrl || '').trim(),
        customBgMobileUrl: (customBgMobileUrl || '').trim(),
        themeMode,
        glassBlur,
        glassOpacity,
      };

      const res = await onUpdateSettings?.(payload);
      if (res?.success) {
        showToast?.({
          title: 'Appearance Updated!',
          message: 'Glass effects and theme adjustments saved live.',
          type: 'success',
        });
      } else {
        throw new Error(res?.error || 'Failed to update settings');
      }
    } catch (err) {
      console.error('Failed to save appearance settings:', err);
      showToast?.({
        title: 'Error Saving Settings',
        message: err.message || 'Please try again.',
        type: 'error',
      });
    }
  };

  // Filtered preset themes by category
  const filteredThemes = PRESET_THEMES.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  // Active theme object
  const currentPreset = PRESET_THEMES.find((p) => p.id === activeTheme) || PRESET_THEMES[0];
  const isCustom = activeTheme === 'custom';
  const effectiveBg = isCustom
    ? (previewDevice === 'mobile' && customBgMobileUrl ? customBgMobileUrl : customBgUrl) || '/offwhite-bg.jpg'
    : (previewDevice === 'mobile' ? currentPreset.mobileBg : currentPreset.desktopBg) || currentPreset.desktopBg;
  const isCurrentDark = isCustom ? themeMode === 'dark' : currentPreset.mode === 'dark';

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* ========================================================================= */}
      {/* 1. TOP ACTIVE THEME STATUS HERO BANNER                                    */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-950 text-white p-6 sm:p-7 shadow-xl border border-white/10">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-600/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Live Active Wallpaper Preview Thumbnail */}
            <div
              className="w-28 sm:w-36 h-20 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-white/20 shadow-xl relative flex flex-col justify-between p-2 group bg-neutral-900"
              style={{
                background: currentPreset.previewGradient,
                backgroundImage: effectiveBg ? `url('${effectiveBg}')` : currentPreset.previewGradient,
                backgroundSize: 'cover',
                backgroundPosition: currentPreset.previewPosition || 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Light mode grid overlay */}
              {!isCurrentDark && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-50"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.08) 1px, transparent 0)',
                    backgroundSize: '10px 10px',
                  }}
                />
              )}

              {/* Status pill inside thumbnail */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white flex items-center space-x-1 shadow-xs">
                  <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                  <span>LIVE</span>
                </span>
                <span
                  className="w-2 h-2 rounded-full border border-white/30"
                  style={{ backgroundColor: currentPreset.accentColor || '#6366f1' }}
                />
              </div>

              {/* Mini Frosted Glass Window */}
              <div
                className={`relative z-10 rounded-md p-1.5 flex items-center justify-between ${
                  isCurrentDark
                    ? 'bg-neutral-950/70 border border-white/15'
                    : 'bg-white/80 border border-white shadow-xs'
                }`}
              >
                <div className="flex items-center space-x-1 min-w-0">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: currentPreset.accentColor || '#6366f1' }}
                  />
                  <span
                    className={`text-[8px] font-black truncate uppercase ${
                      isCurrentDark ? 'text-white' : 'text-neutral-900'
                    }`}
                  >
                    TECHNICALSKY
                  </span>
                </div>
                <div className="flex space-x-0.5 shrink-0">
                  <span
                    className={`w-1.5 h-1.5 rounded-xs ${
                      isCurrentDark ? 'bg-white/20' : 'bg-neutral-200'
                    }`}
                  />
                  <span
                    className={`w-1.5 h-1.5 rounded-xs ${
                      isCurrentDark ? 'bg-white/20' : 'bg-neutral-200'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2.5">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Active Theme</span>
                </span>
                <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
                  {isCurrentDark ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mt-1 text-white">
                {currentPreset.name}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 max-w-xl">
                {currentPreset.subtitle} — Real-time auto-synced across all visitors.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={() => window.open('/', '_blank')}
              className="inline-flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-xl bg-white text-neutral-950 text-xs sm:text-sm font-bold shadow-md hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer"
            >
              <ExternalLink size={14} />
              <span>Open Storefront in New Tab</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PRESET THEMES GRID WITH CLEAN, CRISP WALLPAPER TILES                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-neutral-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight flex items-center space-x-2">
              <Sparkles size={18} className="text-indigo-600" />
              <span>Curated Theme Collection</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Click any theme or &quot;Activate Theme&quot; to apply instantly to your website with 0ms delay.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-neutral-100 p-1 rounded-xl shrink-0 overflow-x-auto">
            {[
              { id: 'all', label: 'All Themes', count: PRESET_THEMES.length },
              { id: 'light', label: '☀️ Light', count: PRESET_THEMES.filter((t) => t.category === 'light').length },
              { id: 'dark', label: '🌙 Dark', count: PRESET_THEMES.filter((t) => t.category === 'dark').length },
              { id: 'custom', label: '🎨 Custom' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === tab.id
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {tab.label} {tab.count !== undefined && `(${tab.count})`}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredThemes.map((theme) => {
            const isSelected = activeTheme === theme.id;
            const isApplying = isApplyingThemeId === theme.id;
            const isAnyApplying = Boolean(isApplyingThemeId);

            return (
              <div
                key={theme.id}
                onClick={() => {
                  if (isAnyApplying) return;
                  if (!isSelected) handleActivateTheme(theme.id);
                }}
                className={`group relative rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/25 shadow-lg ring-2 ring-indigo-500/20'
                    : isAnyApplying
                    ? 'border-neutral-200/60 bg-white opacity-60 cursor-not-allowed'
                    : 'border-neutral-200/90 hover:border-neutral-300 bg-white hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                }`}
              >
                <div>
                  {/* Rich Miniature Storefront Wallpaper & Frosted Glass Preview */}
                  <div
                    className="w-full aspect-[16/10] rounded-xl overflow-hidden relative shadow-md border border-neutral-200/90 dark:border-white/10 flex flex-col justify-between p-2 sm:p-2.5 transition-transform duration-300 group-hover:scale-[1.01] bg-neutral-900"
                    style={{
                      background: theme.previewGradient,
                      backgroundImage: theme.desktopBg ? `url('${theme.desktopBg}')` : theme.previewGradient,
                      backgroundSize: 'cover',
                      backgroundPosition: theme.previewPosition || 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    {/* Light Mode coordinate grid pattern overlay for crisp architectural feel */}
                    {theme.mode !== 'dark' && (
                      <div
                        className="absolute inset-0 pointer-events-none opacity-60"
                        style={{
                          backgroundImage:
                            'radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.08) 1px, transparent 0)',
                          backgroundSize: '12px 12px',
                        }}
                      />
                    )}

                    {/* Subtle top specular sheen */}
                    <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

                    {/* Top Overlay Badges */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-xs flex items-center space-x-1 ${
                          theme.mode === 'dark'
                            ? 'bg-neutral-900/80 text-neutral-200 border border-white/15'
                            : 'bg-white/90 text-neutral-800 border border-neutral-900/10'
                        }`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: theme.accentColor || '#6366f1' }}
                        />
                        <span>{theme.mode === 'dark' ? '🌙 Dark' : '☀️ Light'}</span>
                      </span>

                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9.5px] font-extrabold flex items-center space-x-1 shadow-md animate-fade-in">
                          <Check size={11} className="stroke-[3]" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span
                          className={`text-[9.5px] font-semibold backdrop-blur-md px-2 py-0.5 rounded-full ${
                            theme.mode === 'dark'
                              ? 'bg-black/60 text-white/90 border border-white/10'
                              : 'bg-white/80 text-neutral-700 border border-black/5'
                          }`}
                        >
                          {theme.tag}
                        </span>
                      )}
                    </div>

                    {/* Center: Floating Liquid Frosted Glass Storefront Panel */}
                    <div
                      className={`relative z-10 w-full rounded-lg p-2 flex flex-col justify-between my-auto transition-all shadow-sm ${
                        theme.mode === 'dark'
                          ? 'bg-neutral-950/60 backdrop-blur-md border border-white/15'
                          : 'bg-white/70 backdrop-blur-md border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
                      }`}
                    >
                      {/* Mini Header */}
                      <div
                        className={`flex items-center justify-between pb-1.5 mb-1.5 border-b ${
                          theme.mode === 'dark' ? 'border-white/10' : 'border-neutral-900/5'
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: theme.accentColor || '#6366f1' }}
                          />
                          <span
                            className={`text-[8px] font-black tracking-widest uppercase ${
                              theme.mode === 'dark' ? 'text-white' : 'text-neutral-900'
                            }`}
                          >
                            TECHNICALSKY
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <span
                            className={`w-3 h-1 rounded-full ${
                              theme.mode === 'dark' ? 'bg-white/50' : 'bg-neutral-900/40'
                            }`}
                          />
                          <span
                            className={`w-3 h-1 rounded-full ${
                              theme.mode === 'dark' ? 'bg-white/20' : 'bg-neutral-900/15'
                            }`}
                          />
                          <span
                            className={`w-3 h-1 rounded-full ${
                              theme.mode === 'dark' ? 'bg-white/20' : 'bg-neutral-900/15'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Mini 3-Product Cards Row */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { price: '₹9,999' },
                          { price: '₹4,499' },
                          { price: '₹2,299' },
                        ].map((card, i) => (
                          <div
                            key={i}
                            className={`rounded-md p-1 flex flex-col justify-between border ${
                              theme.mode === 'dark'
                                ? 'bg-neutral-900/70 border-white/10 shadow-[0_2px_6px_rgba(0,0,0,0.4)]'
                                : 'bg-white/85 border-white shadow-[0_2px_6px_rgba(0,0,0,0.04)]'
                            }`}
                          >
                            <div
                              className={`w-full aspect-[4/3] rounded-xs mb-1 flex items-center justify-center ${
                                theme.mode === 'dark' ? 'bg-neutral-800' : 'bg-neutral-100'
                              }`}
                            >
                              <div
                                className="w-2.5 h-2.5 rounded-xs opacity-75"
                                style={{ backgroundColor: theme.accentColor || '#6366f1' }}
                              />
                            </div>
                            <div
                              className={`h-1 w-3/4 rounded-full mb-0.5 ${
                                theme.mode === 'dark' ? 'bg-white/40' : 'bg-neutral-900/30'
                              }`}
                            />
                            <span
                              className="text-[7.5px] font-extrabold tracking-tight"
                              style={{ color: theme.accentColor || '#6366f1' }}
                            >
                              {card.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Accent Color Indicator */}
                    <div
                      className="relative z-10 w-full h-0.5 rounded-full opacity-80"
                      style={{ backgroundColor: theme.accentColor || '#6366f1' }}
                    />
                  </div>

                  {/* Theme Info */}
                  <div className="mt-3.5">
                    <h3 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
                      {theme.name}
                    </h3>
                    <p className="text-xs font-medium text-neutral-400 mt-0.5">
                      {theme.subtitle}
                    </p>
                    <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
                      {theme.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Full-Width Action Button */}
                <div className="mt-4 pt-3 border-t border-neutral-100">
                  {isSelected ? (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/90 text-xs font-bold flex items-center justify-center space-x-1.5 shadow-2xs">
                      <Check size={14} className="stroke-[3] text-emerald-600" />
                      <span>Currently Active on Store</span>
                    </div>
                  ) : isApplying ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm cursor-wait animate-pulse"
                    >
                      <RefreshCw size={13} className="animate-spin text-white" />
                      <span>Activating Theme...</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isAnyApplying}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivateTheme(theme.id);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-indigo-600 active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-900"
                    >
                      <Zap size={13} />
                      <span>Activate Theme</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CUSTOM WALLPAPER UPLOAD & GLASS DISPERSION CONTROLS                     */}
      {/* ========================================================================= */}
      <div
        className={`bg-white rounded-2xl p-5 sm:p-6 shadow-sm border transition-all ${
          isCustom
            ? 'border-indigo-500 ring-2 ring-indigo-500/10'
            : 'border-neutral-200/80 opacity-95'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-neutral-100">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Upload size={19} />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                Custom Wallpaper & Styling Controls
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Upload your own custom background photo or paste any image URL with tailored glass dispersion controls.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isCustom && (
              <button
                type="button"
                disabled={Boolean(isApplyingThemeId)}
                onClick={() => handleActivateTheme('custom')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Switch to Custom Mode
              </button>
            )}

            <button
              type="button"
              disabled={Boolean(isApplyingThemeId)}
              onClick={handleSaveCustomConfig}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={13} />
              <span>Save Adjustments</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Desktop Wallpaper Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center space-x-1.5">
                <Monitor size={14} className="text-neutral-400" />
                <span>Desktop Wallpaper</span>
              </label>
              {customBgUrl && (
                <button
                  type="button"
                  onClick={() => setCustomBgUrl('')}
                  className="text-[11px] text-red-500 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div
              onClick={() => desktopFileInputRef.current?.click()}
              className="group relative border-2 border-dashed border-neutral-300 hover:border-indigo-500 rounded-xl p-5 text-center cursor-pointer transition-all bg-neutral-50 hover:bg-indigo-50/20"
            >
              <input
                ref={desktopFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, false);
                }}
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-11 h-11 rounded-full bg-white shadow-xs border border-neutral-200 flex items-center justify-center text-neutral-500 group-hover:text-indigo-600 transition-colors">
                  {isUploadingDesktop ? (
                    <RefreshCw size={20} className="animate-spin text-indigo-600" />
                  ) : (
                    <Upload size={20} />
                  )}
                </div>
                <div className="text-xs font-bold text-neutral-800">
                  {isUploadingDesktop ? 'Uploading desktop image...' : 'Click to upload desktop wallpaper'}
                </div>
                <div className="text-[11px] text-neutral-400">
                  JPG, PNG, WebP up to 15MB
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-500">
                Or direct image URL:
              </label>
              <input
                type="url"
                value={customBgUrl}
                onChange={(e) => {
                  setCustomBgUrl(e.target.value);
                }}
                placeholder="https://example.com/wallpaper.jpg"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>

          {/* Mobile Wallpaper Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center space-x-1.5">
                <Smartphone size={14} className="text-neutral-400" />
                <span>Mobile Wallpaper (Optional)</span>
              </label>
              {customBgMobileUrl && (
                <button
                  type="button"
                  onClick={() => setCustomBgMobileUrl('')}
                  className="text-[11px] text-red-500 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div
              onClick={() => mobileFileInputRef.current?.click()}
              className="group relative border-2 border-dashed border-neutral-300 hover:border-indigo-500 rounded-xl p-5 text-center cursor-pointer transition-all bg-neutral-50 hover:bg-indigo-50/20"
            >
              <input
                ref={mobileFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, true);
                }}
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-11 h-11 rounded-full bg-white shadow-xs border border-neutral-200 flex items-center justify-center text-neutral-500 group-hover:text-indigo-600 transition-colors">
                  {isUploadingMobile ? (
                    <RefreshCw size={20} className="animate-spin text-indigo-600" />
                  ) : (
                    <Smartphone size={20} />
                  )}
                </div>
                <div className="text-xs font-bold text-neutral-800">
                  {isUploadingMobile ? 'Uploading mobile image...' : 'Click to upload portrait mobile wallpaper'}
                </div>
                <div className="text-[11px] text-neutral-400">
                  Portrait 9:16 aspect ratio recommended
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-500">
                Or direct mobile image URL:
              </label>
              <input
                type="url"
                value={customBgMobileUrl}
                onChange={(e) => {
                  setCustomBgMobileUrl(e.target.value);
                }}
                placeholder="https://example.com/mobile-wallpaper.jpg"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Theme Mode & Frosted Glass Sliders */}
        <div className="mt-6 pt-5 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Mode Switcher */}
          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-2">
              Color Mode
            </label>
            <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-xl">
              <button
                type="button"
                disabled={Boolean(isApplyingThemeId)}
                onClick={() => {
                  setThemeMode('light');
                  if (isCustom) handleActivateTheme('custom', 'light');
                }}
                className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                  themeMode === 'light'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Sun size={14} className="text-amber-500" />
                <span>Light</span>
              </button>

              <button
                type="button"
                disabled={Boolean(isApplyingThemeId)}
                onClick={() => {
                  setThemeMode('dark');
                  if (isCustom) handleActivateTheme('custom', 'dark');
                }}
                className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                  themeMode === 'dark'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Moon size={14} className="text-indigo-400" />
                <span>Dark</span>
              </button>
            </div>
            <span className="text-[10px] text-neutral-400 mt-1 block">
              Light for bright wallpapers, Dark for black/slate images.
            </span>
          </div>

          {/* Glass Transparency */}
          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-2">
              Glass Transparency
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-neutral-100 p-1 rounded-xl">
              {[
                { id: 'subtle', label: 'Clear' },
                { id: 'medium', label: 'Balanced' },
                { id: 'heavy', label: 'Solid' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGlassOpacity(opt.id)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    glassOpacity === opt.id
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-neutral-400 mt-1 block">
              Controls front card transparency over the wallpaper.
            </span>
          </div>

          {/* Frost Blur Level */}
          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-2">
              Frost Blur Level
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-neutral-100 p-1 rounded-xl">
              {[
                { id: 'low', label: 'Soft' },
                { id: 'medium', label: 'Medium' },
                { id: 'high', label: 'Deep' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGlassBlur(opt.id)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    glassBlur === opt.id
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-neutral-400 mt-1 block">
              Optical glass dispersion blur strength.
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. LIVE INTERACTIVE STOREFRONT SIMULATOR                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-neutral-200/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
              Interactive Storefront Preview
            </h2>
          </div>

          {/* Device Toggle */}
          <div className="flex items-center space-x-1 bg-neutral-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                previewDevice === 'desktop'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Desktop View"
            >
              <Monitor size={15} />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                previewDevice === 'mobile'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Mobile View"
            >
              <Smartphone size={15} />
            </button>
          </div>
        </div>

        {/* Simulated Browser Frame */}
        <div className="rounded-2xl border border-neutral-300/80 overflow-hidden shadow-inner bg-neutral-900 flex justify-center">
          <div
            className={`transition-all duration-300 relative overflow-hidden flex flex-col justify-start ${
              previewDevice === 'mobile' ? 'w-[360px] min-h-[460px] p-3' : 'w-full min-h-[400px] p-4 sm:p-6'
            }`}
            style={{
              backgroundColor: isCurrentDark ? '#0f172a' : '#ECEEF2',
              backgroundImage: effectiveBg ? `url('${effectiveBg}')` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'top center',
            }}
          >
            {/* Front Floating Frosted Glass Canvas */}
            <div
              className={`flex-1 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all ${
                isCurrentDark
                  ? glassOpacity === 'subtle'
                    ? 'bg-black/25'
                    : glassOpacity === 'heavy'
                    ? 'bg-black/65'
                    : 'bg-black/40'
                  : glassOpacity === 'subtle'
                  ? 'bg-white/25'
                  : glassOpacity === 'heavy'
                  ? 'bg-white/70'
                  : 'bg-white/45'
              } ${
                glassBlur === 'low'
                  ? 'backdrop-blur-sm'
                  : glassBlur === 'high'
                  ? 'backdrop-blur-3xl'
                  : 'backdrop-blur-xl'
              } border ${
                isCurrentDark ? 'border-white/10 text-white' : 'border-white/80 text-neutral-900'
              } shadow-lg`}
            >
              {/* Top Mini Header */}
              <div className="flex items-center justify-between pb-3 border-b border-current/10">
                <div className="flex items-center space-x-2">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-black/10"
                  />
                  <span className="text-xs font-black tracking-widest uppercase">
                    {settings?.brandWordmark || 'TECHNICALSKY'}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] font-medium opacity-80">
                  <span className="font-bold underline">Shop</span>
                  <span>About</span>
                  <span>Contact</span>
                </div>
              </div>

              {/* Title row */}
              <div className="py-2.5">
                <span className="text-base font-serif font-normal">/ Shop</span>
                <span className="text-[10px] opacity-60 ml-2">Curated discoveries</span>
              </div>

              {/* Mini Cards Grid */}
              <div className={`grid gap-2.5 ${previewDevice === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'}`}>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-2 text-center transition-all shadow-xs border ${
                      isCurrentDark
                        ? 'bg-neutral-900/80 border-white/10 text-white'
                        : 'bg-white/85 border-white/90 text-neutral-900'
                    }`}
                  >
                    <div className="w-full aspect-square rounded-lg bg-white flex items-center justify-center mb-1.5 shadow-2xs border border-neutral-100">
                      <Sparkles size={13} className="text-amber-500" />
                    </div>
                    <div className="h-2 w-14 bg-current opacity-70 rounded-full mx-auto mb-1" />
                    <div className="h-1.5 w-8 bg-current opacity-40 rounded-full mx-auto" />
                  </div>
                ))}
              </div>

              {/* Bottom tag */}
              <div className="pt-2 text-center text-[10px] opacity-60">
                Active Theme: <span className="font-bold">{currentPreset.name}</span> ({isCurrentDark ? 'Dark Mode' : 'Light Mode'})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
