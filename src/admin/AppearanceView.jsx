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
} from 'lucide-react';
import { PRESET_THEMES } from '../data/themes';
import { api } from '../api/client';

export default function AppearanceView({
  settings,
  onUpdateSettings,
  showToast,
  onNavigateToStorefront,
}) {
  const [activeTheme, setActiveTheme] = useState(settings?.activeTheme || 'offwhite-grid');
  const [customBgUrl, setCustomBgUrl] = useState(settings?.customBgUrl || '');
  const [customBgMobileUrl, setCustomBgMobileUrl] = useState(settings?.customBgMobileUrl || '');
  const [themeMode, setThemeMode] = useState(settings?.themeMode || 'light');
  const [glassBlur, setGlassBlur] = useState(settings?.glassBlur || 'medium');
  const [glassOpacity, setGlassOpacity] = useState(settings?.glassOpacity || 'medium');

  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'

  const desktopFileInputRef = useRef(null);
  const mobileFileInputRef = useRef(null);

  // Sync state if settings prop changes from backend
  useEffect(() => {
    if (settings) {
      setActiveTheme(settings.activeTheme || 'offwhite-grid');
      setCustomBgUrl(settings.customBgUrl || '');
      setCustomBgMobileUrl(settings.customBgMobileUrl || '');
      setThemeMode(settings.themeMode || 'light');
      setGlassBlur(settings.glassBlur || 'medium');
      setGlassOpacity(settings.glassOpacity || 'medium');
    }
  }, [settings]);

  // Handle Preset Select
  const handleSelectPreset = (presetId) => {
    setActiveTheme(presetId);
    const preset = PRESET_THEMES.find((p) => p.id === presetId);
    if (preset && preset.mode !== 'custom') {
      setThemeMode(preset.mode);
    }
    setSavedSuccess(false);
  };

  // Upload handler for custom background
  const handleFileUpload = async (file, isMobile = false) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast?.('Please upload a valid image file (JPG, PNG, WebP).', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast?.('Image is too large. Max size is 15MB.', 'error');
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

      setActiveTheme('custom');
      showToast?.(`${isMobile ? 'Mobile' : 'Desktop'} background uploaded successfully!`, 'success');
    } catch (err) {
      console.error('Background upload error:', err);
      showToast?.('Failed to upload image. Please try again or paste image URL.', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Save changes to backend
  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const payload = {
        activeTheme,
        customBgUrl: customBgUrl.trim(),
        customBgMobileUrl: customBgMobileUrl.trim(),
        themeMode,
        glassBlur,
        glassOpacity,
      };

      const res = await onUpdateSettings?.(payload);
      if (res?.success) {
        setSavedSuccess(true);
        showToast?.('Theme & appearance updated live on storefront!', 'success');
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        throw new Error(res?.error || 'Failed to update settings');
      }
    } catch (err) {
      console.error('Failed to save appearance settings:', err);
      showToast?.('Could not save appearance settings. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Determine current active preview background URL & dark mode
  const currentPreset = PRESET_THEMES.find((p) => p.id === activeTheme) || PRESET_THEMES[0];
  const isCustom = activeTheme === 'custom';
  const effectiveBg = isCustom
    ? (previewDevice === 'mobile' && customBgMobileUrl ? customBgMobileUrl : customBgUrl) || '/offwhite-bg.jpg'
    : (previewDevice === 'mobile' ? currentPreset.mobileBg : currentPreset.desktopBg) || currentPreset.desktopBg;
  const isCurrentDark = isCustom ? themeMode === 'dark' : currentPreset.mode === 'dark';

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* View Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Palette size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Theme & Appearance
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
            Switch between curated technical themes or upload custom wallpapers. Changes sync in real-time across the live website.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          {onNavigateToStorefront && (
            <button
              onClick={onNavigateToStorefront}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <Eye size={14} />
              <span>Preview Live</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-sm transition-all cursor-pointer ${
              savedSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-neutral-900 hover:bg-neutral-800 active:scale-95'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSaving ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : savedSuccess ? (
              <CheckCircle2 size={15} />
            ) : (
              <Save size={15} />
            )}
            <span>{savedSuccess ? 'Saved Live!' : isSaving ? 'Saving...' : 'Apply Theme'}</span>
          </button>
        </div>
      </div>

      {/* Preset Themes Grid */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-neutral-200/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-neutral-900">
              Preset Themes
            </h2>
            <p className="text-xs text-neutral-500">
              Select any pre-designed background style to apply instantly
            </p>
          </div>
          <span className="text-[11px] font-medium text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-full">
            {PRESET_THEMES.length} Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {PRESET_THEMES.map((theme) => {
            const isSelected = activeTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => handleSelectPreset(theme.id)}
                className={`group relative rounded-2xl p-3.5 sm:p-4 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-neutral-200/90 hover:border-neutral-300 bg-white hover:shadow-sm'
                }`}
              >
                {/* Visual Preview Swatch */}
                <div
                  className="w-full h-28 sm:h-32 rounded-xl overflow-hidden relative flex flex-col justify-between p-2.5 shadow-inner border border-black/5"
                  style={{
                    background: theme.previewGradient,
                    backgroundImage: theme.desktopBg ? `url('${theme.desktopBg}')` : theme.previewGradient,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Floating badge inside card */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-xs ${
                        theme.mode === 'dark'
                          ? 'bg-black/60 text-white'
                          : 'bg-white/80 text-neutral-900'
                      }`}
                    >
                      {theme.mode === 'dark' ? 'Dark' : 'Light'}
                    </span>

                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                        <Check size={14} />
                      </span>
                    )}
                  </div>

                  {/* Mini simulated storefront card floating over the background */}
                  <div
                    className={`rounded-lg p-1.5 flex items-center space-x-2 border shadow-xs ${
                      theme.mode === 'dark'
                        ? 'bg-neutral-900/60 backdrop-blur-md border-white/10 text-white'
                        : 'bg-white/75 backdrop-blur-md border-white/80 text-neutral-900'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-md bg-white/90 shrink-0 shadow-2xs" />
                    <div className="flex-1 min-w-0">
                      <div className="h-1.5 w-12 bg-current opacity-60 rounded-full mb-1" />
                      <div className="h-1 w-8 bg-current opacity-30 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Theme Title & Meta */}
                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                      {theme.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                      {theme.tag}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                    {theme.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Theme & Wallpaper Configuration Panel */}
      <div
        className={`bg-white rounded-2xl p-5 sm:p-6 shadow-sm border transition-all ${
          isCustom
            ? 'border-indigo-500 ring-2 ring-indigo-500/10'
            : 'border-neutral-200/80 opacity-95'
        }`}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Upload size={17} />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-neutral-900">
                Custom Wallpaper & Theme Controls
              </h2>
              <p className="text-xs text-neutral-500">
                Upload your own image file or link any online wallpaper URL
              </p>
            </div>
          </div>

          {!isCustom && (
            <button
              onClick={() => handleSelectPreset('custom')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              Switch to Custom
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Desktop Wallpaper Box */}
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

            {/* Drag & Drop / Upload Tile */}
            <div
              onClick={() => desktopFileInputRef.current?.click()}
              className="group relative border-2 border-dashed border-neutral-300 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer transition-all bg-neutral-50 hover:bg-indigo-50/20"
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
              <div className="flex flex-col items-center justify-center space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-neutral-200 flex items-center justify-center text-neutral-500 group-hover:text-indigo-600 transition-colors">
                  {isUploadingDesktop ? (
                    <RefreshCw size={18} className="animate-spin text-indigo-600" />
                  ) : (
                    <Upload size={18} />
                  )}
                </div>
                <div className="text-xs font-semibold text-neutral-800">
                  {isUploadingDesktop ? 'Uploading image...' : 'Click to upload desktop wallpaper'}
                </div>
                <div className="text-[11px] text-neutral-400">
                  PNG, JPG, WebP up to 15MB
                </div>
              </div>
            </div>

            {/* Direct URL Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-500">
                Or enter image URL:
              </label>
              <input
                type="url"
                value={customBgUrl}
                onChange={(e) => {
                  setCustomBgUrl(e.target.value);
                  setActiveTheme('custom');
                }}
                placeholder="https://example.com/wallpaper.jpg"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>

          {/* Mobile Wallpaper Box (Optional) */}
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

            {/* Drag & Drop / Upload Tile */}
            <div
              onClick={() => mobileFileInputRef.current?.click()}
              className="group relative border-2 border-dashed border-neutral-300 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer transition-all bg-neutral-50 hover:bg-indigo-50/20"
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
              <div className="flex flex-col items-center justify-center space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-neutral-200 flex items-center justify-center text-neutral-500 group-hover:text-indigo-600 transition-colors">
                  {isUploadingMobile ? (
                    <RefreshCw size={18} className="animate-spin text-indigo-600" />
                  ) : (
                    <Smartphone size={18} />
                  )}
                </div>
                <div className="text-xs font-semibold text-neutral-800">
                  {isUploadingMobile ? 'Uploading mobile image...' : 'Click to upload portrait mobile wallpaper'}
                </div>
                <div className="text-[11px] text-neutral-400">
                  Portrait 9:16 aspect ratio recommended
                </div>
              </div>
            </div>

            {/* Direct URL Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-500">
                Or enter mobile image URL:
              </label>
              <input
                type="url"
                value={customBgMobileUrl}
                onChange={(e) => {
                  setCustomBgMobileUrl(e.target.value);
                  setActiveTheme('custom');
                }}
                placeholder="https://example.com/mobile-wallpaper.jpg"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Theme Mode & Glass Controls */}
        <div className="mt-6 pt-5 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Mode Switcher */}
          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-2">
              Color Mode
            </label>
            <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
                onClick={() => setThemeMode('dark')}
                className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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

          {/* Glass Opacity */}
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
                  className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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

          {/* Glass Blur Level */}
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
                  className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
              Amount of optical frosted glass dispersion.
            </span>
          </div>
        </div>
      </div>

      {/* Live Preview Window */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-neutral-200/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm sm:text-base font-bold text-neutral-900">
              Live Preview
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
              previewDevice === 'mobile' ? 'w-[360px] min-h-[460px] p-3' : 'w-full min-h-[380px] p-4 sm:p-6'
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
                  <div className="w-6 h-6 rounded-full bg-indigo-500 ring-2 ring-white/30" />
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
                    <div className="w-full aspect-square rounded-lg bg-neutral-100 flex items-center justify-center mb-1.5">
                      <Sparkles size={12} className="text-neutral-400" />
                    </div>
                    <div className="h-2 w-12 bg-current opacity-70 rounded-full mx-auto mb-1" />
                    <div className="h-1.5 w-8 bg-current opacity-40 rounded-full mx-auto" />
                  </div>
                ))}
              </div>

              {/* Bottom tag */}
              <div className="pt-2 text-center text-[10px] opacity-50">
                Active Theme: <span className="font-semibold">{currentPreset.name}</span> ({isCurrentDark ? 'Dark Mode' : 'Light Mode'})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
