/**
 * TechnicalSky Theme & Appearance Preset Catalog & Resolver
 */

export const PRESET_THEMES = [
  {
    id: 'offwhite-grid',
    name: 'Off-White Blueprint Grid',
    subtitle: 'Sillycorns Luxury Light Mode',
    description: 'Fine technical coordinate grid with graphite ribbon flourishes and frosted glass canvas.',
    desktopBg: '/offwhite-bg.jpg',
    mobileBg: '/offwhite-bg-m.jpg',
    mode: 'light',
    previewGradient: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
    tag: 'Active Default',
    accentColor: '#171717',
  },
  {
    id: 'dark-tech-grid',
    name: 'Dark Tech Matrix Grid',
    subtitle: 'Sillycorns Stealth Dark Mode',
    description: 'Deep obsidian blueprint with luminous cyan coordinate grid and curved ribbons.',
    desktopBg: '/sillycorns-dark-d.jpg',
    mobileBg: '/sillycorns-dark-m.jpg',
    mode: 'dark',
    previewGradient: 'linear-gradient(135deg, #161919 0%, #0d0f0f 100%)',
    tag: 'High Contrast',
    accentColor: '#4fd1c5',
  },
  {
    id: 'titanium-matrix',
    name: 'Brushed Titanium Dot-Matrix',
    subtitle: 'Apple Aerospace Hardware Aesthetic',
    description: 'Precision brushed metal texture with micro-dot matrix technical grid.',
    desktopBg: '/tech-bg.jpg',
    mobileBg: '/tech-bg.jpg',
    mode: 'light',
    previewGradient: 'linear-gradient(135deg, #E2E4E8 0%, #CDD1D7 100%)',
    tag: 'Minimal Tech',
    accentColor: '#0f172a',
  },
  {
    id: 'arctic-cyan',
    name: 'Arctic Tech Slate-Cyan',
    subtitle: 'Nordic Clean High-Tech',
    description: 'Crisp light alabaster with cool arctic cyan tech grid lines and soft ambient lighting.',
    desktopBg: '/offwhite-cyan-bg.jpg',
    mobileBg: '/offwhite-cyan-bg-m.jpg',
    mode: 'light',
    previewGradient: 'linear-gradient(135deg, #E6ECEE 0%, #D2DEE2 100%)',
    tag: 'Cool Tone',
    accentColor: '#0891b2',
  },
  {
    id: 'warm-alabaster',
    name: 'Warm Studio Alabaster',
    subtitle: 'Editorial Gallery Aesthetic',
    description: 'Warm natural pearl off-white with delicate architectural blueprint lines.',
    desktopBg: '/offwhite-warm-bg.jpg',
    mobileBg: '/offwhite-warm-bg-m.jpg',
    mode: 'light',
    previewGradient: 'linear-gradient(135deg, #F8F7F4 0%, #E8E5DF 100%)',
    tag: 'Warm Ceramic',
    accentColor: '#292524',
  },
  {
    id: 'custom',
    name: 'Custom Wallpaper',
    subtitle: 'Upload Your Own Artwork / Background',
    description: 'Upload any high-res wallpaper image or paste a direct image URL with custom light/dark controls.',
    desktopBg: null,
    mobileBg: null,
    mode: 'custom',
    previewGradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    tag: 'Client Upload',
    accentColor: '#6366f1',
  },
];

/**
 * Resolves current active theme configuration from store settings
 */
export function resolveTheme(settings) {
  const activeId = settings?.activeTheme || 'offwhite-grid';
  const preset = PRESET_THEMES.find((t) => t.id === activeId) || PRESET_THEMES[0];

  if (activeId === 'custom') {
    const desktopUrl = settings?.customBgUrl || '/offwhite-bg.jpg';
    const mobileUrl = settings?.customBgMobileUrl || desktopUrl;
    const isDark = (settings?.themeMode || 'light') === 'dark';

    return {
      id: 'custom',
      name: 'Custom Theme',
      subtitle: 'Client Custom Background',
      desktopBg: desktopUrl,
      mobileBg: mobileUrl,
      isDark,
      mode: isDark ? 'dark' : 'light',
      glassBlur: settings?.glassBlur || 'medium',
      glassOpacity: settings?.glassOpacity || 'medium',
    };
  }

  return {
    ...preset,
    isDark: preset.mode === 'dark',
    glassBlur: settings?.glassBlur || 'medium',
    glassOpacity: settings?.glassOpacity || 'medium',
  };
}
