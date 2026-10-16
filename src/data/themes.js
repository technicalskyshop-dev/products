/**
 * TechnicalSky Theme & Appearance Preset Catalog & Resolver
 */

export const PRESET_THEMES = [
  // --- Curated Light & Off-White Themes ---
  {
    id: 'offwhite-grid',
    name: 'Off-White Blueprint Grid',
    subtitle: 'Sillycorns Luxury Light Mode',
    description: 'Fine technical coordinate grid with graphite ribbon flourishes and frosted glass canvas.',
    desktopBg: '/offwhite-bg.jpg',
    mobileBg: '/offwhite-bg-m.jpg',
    mode: 'light',
    category: 'light',
    previewGradient: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
    tag: 'Light Blueprint',
    accentColor: '#171717',
  },
  {
    id: 'arctic-cyan',
    name: 'Arctic Tech Slate-Cyan',
    subtitle: 'Nordic Clean High-Tech',
    description: 'Crisp light alabaster with cool arctic cyan tech grid lines and soft ambient lighting.',
    desktopBg: '/offwhite-cyan-bg.jpg',
    mobileBg: '/offwhite-cyan-bg-m.jpg',
    mode: 'light',
    category: 'light',
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
    category: 'light',
    previewGradient: 'linear-gradient(135deg, #F8F7F4 0%, #E8E5DF 100%)',
    tag: 'Warm Ceramic',
    accentColor: '#292524',
  },
  {
    id: 'titanium-matrix',
    name: 'Brushed Titanium Dot-Matrix',
    subtitle: 'Apple Aerospace Hardware Aesthetic',
    description: 'Precision brushed metal texture with micro-dot matrix technical grid.',
    desktopBg: '/tech-bg.jpg',
    mobileBg: '/tech-bg.jpg',
    mode: 'light',
    category: 'light',
    previewGradient: 'linear-gradient(135deg, #E2E4E8 0%, #CDD1D7 100%)',
    tag: 'Apple Tech',
    accentColor: '#0f172a',
  },

  // --- Curated Dark & Cyber Stealth Themes ---
  {
    id: 'dark-tech-grid',
    name: 'Dark Tech Matrix Grid',
    subtitle: 'Sillycorns Stealth Dark Mode',
    description: 'Deep obsidian blueprint with luminous cyan coordinate grid and curved ribbons.',
    desktopBg: '/sillycorns-dark-d.jpg',
    mobileBg: '/sillycorns-dark-m.jpg',
    mode: 'dark',
    category: 'dark',
    previewGradient: 'linear-gradient(135deg, #161919 0%, #0d0f0f 100%)',
    tag: 'Stealth Dark',
    accentColor: '#4fd1c5',
  },
  {
    id: 'cyberpunk-monolith',
    name: 'Cyberpunk Monolith Lasers',
    subtitle: 'Blade Runner Tech Aesthetic',
    description: 'Matte obsidian pillars with sleek vertical neon teal and violet laser bars.',
    desktopBg: '/tech-backgrounds/10-cyberpunk-monolith-lasers.jpg',
    mobileBg: '/tech-backgrounds/10-cyberpunk-monolith-lasers.jpg',
    mode: 'dark',
    category: 'dark',
    previewGradient: 'linear-gradient(135deg, #0f172a 0%, #030712 100%)',
    tag: 'Cyber Neon',
    accentColor: '#06b6d4',
  },
  {
    id: 'fiber-optic',
    name: 'High-Speed Fiber Optic',
    subtitle: 'Quantum Data Highway',
    description: 'Flowing curved fiber optic cable trails glowing with electric cyan and magenta light streaks.',
    desktopBg: '/tech-backgrounds/12-fiber-optic-highway.jpg',
    mobileBg: '/tech-backgrounds/12-fiber-optic-highway.jpg',
    mode: 'dark',
    category: 'dark',
    previewGradient: 'linear-gradient(135deg, #0b1329 0%, #170b29 100%)',
    tag: 'Fiber Highway',
    accentColor: '#ec4899',
  },
  {
    id: 'matrix-code',
    name: 'Matrix Digital Code Rain',
    subtitle: 'Cyber Security Minimalist',
    description: 'Deep midnight backdrop with streaming vertical binary code particles and emerald cyan glow.',
    desktopBg: '/tech-backgrounds/11-matrix-code-rain.jpg',
    mobileBg: '/tech-backgrounds/11-matrix-code-rain.jpg',
    mode: 'dark',
    category: 'dark',
    previewGradient: 'linear-gradient(135deg, #021a12 0%, #020705 100%)',
    tag: 'Matrix Green',
    accentColor: '#10b981',
  },
  {
    id: 'quantum-neural',
    name: 'Quantum Neural Network',
    subtitle: 'Deep AI Constellation Graph',
    description: 'Floating glowing data nodes and particle constellation lines on deep void black.',
    desktopBg: '/tech-backgrounds/06-quantum-neural-network.jpg',
    mobileBg: '/tech-backgrounds/06-quantum-neural-network.jpg',
    mode: 'dark',
    category: 'dark',
    previewGradient: 'linear-gradient(135deg, #050d1a 0%, #02050a 100%)',
    tag: 'AI Neural',
    accentColor: '#38bdf8',
  },
  {
    id: 'hud-blueprint',
    name: 'Futuristic HUD Blueprint',
    subtitle: 'Sci-Fi Telemetry & Interface',
    description: 'Deep navy obsidian backdrop with fine geometric circles and vector wireframe coordinates.',
    desktopBg: '/tech-backgrounds/05-hud-blueprint-schematic.jpg',
    mobileBg: '/tech-backgrounds/05-hud-blueprint-schematic.jpg',
    mode: 'dark',
    category: 'dark',
    previewGradient: 'linear-gradient(135deg, #061120 0%, #030810 100%)',
    tag: 'Sci-Fi HUD',
    accentColor: '#3b82f6',
  },
  {
    id: 'glass-prisms',
    name: 'Geometric Glass Polyhedra',
    subtitle: 'Refractive Luxury 3D Crystals',
    description: 'Floating translucent dark glass prisms with chromatic edge dispersion and specular highlights.',
    desktopBg: '/tech-backgrounds/09-geometric-glass-prisms.jpg',
    mobileBg: '/tech-backgrounds/09-geometric-glass-prisms.jpg',
    mode: 'dark',
    category: 'dark',
    previewGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    tag: 'Glass 3D',
    accentColor: '#818cf8',
  },
  {
    id: 'carbon-hex',
    name: 'Stealth Carbon Fiber Hex',
    subtitle: 'Aerospace Performance Texture',
    description: 'Matte carbon weave with subtle cyan LED backlit hexagonal vents.',
    desktopBg: '/tech-backgrounds/04-carbon-fiber-hex-mesh.jpg',
    mobileBg: '/tech-backgrounds/04-carbon-fiber-hex-mesh.jpg',
    mode: 'dark',
    category: 'dark',
    previewGradient: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
    tag: 'Carbon Fiber',
    accentColor: '#06b6d4',
  },

  // --- Custom Wallpaper Upload ---
  {
    id: 'custom',
    name: 'Custom Wallpaper',
    subtitle: 'Upload Your Artwork / Direct Image URL',
    description: 'Upload any high-res photo/wallpaper or paste any external image URL with tailored controls.',
    desktopBg: null,
    mobileBg: null,
    mode: 'custom',
    category: 'custom',
    previewGradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    tag: 'Custom Upload',
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
