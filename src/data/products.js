export const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'All Collection', slug: 'all', enabled: true, order: 1, createdAt: '2026-10-10T00:00:00.000Z', updatedAt: '2026-10-10T00:00:00.000Z' },
  { id: 'electronics', name: 'Electronics', slug: 'electronics', enabled: true, order: 2, createdAt: '2026-10-10T00:00:00.000Z', updatedAt: '2026-10-10T00:00:00.000Z' },
  { id: 'audio', name: 'Audio', slug: 'audio', enabled: true, order: 3, createdAt: '2026-10-10T00:00:00.000Z', updatedAt: '2026-10-10T00:00:00.000Z' },
  { id: 'charging', name: 'Charging', slug: 'charging', enabled: true, order: 4, createdAt: '2026-10-10T00:00:00.000Z', updatedAt: '2026-10-10T00:00:00.000Z' },
  { id: 'home', name: 'Home', slug: 'home', enabled: true, order: 5, createdAt: '2026-10-10T00:00:00.000Z', updatedAt: '2026-10-10T00:00:00.000Z' },
  { id: 'kitchen', name: 'Kitchen', slug: 'kitchen', enabled: true, order: 6, createdAt: '2026-10-10T00:00:00.000Z', updatedAt: '2026-10-10T00:00:00.000Z' },
  { id: 'wellness', name: 'Wellness', slug: 'wellness', enabled: true, order: 7, createdAt: '2026-10-10T00:00:00.000Z', updatedAt: '2026-10-10T00:00:00.000Z' },
  { id: 'accessories', name: 'Accessories', slug: 'accessories', enabled: true, order: 8, createdAt: '2026-10-10T00:00:00.000Z', updatedAt: '2026-10-10T00:00:00.000Z' },
];

export const CATEGORIES = DEFAULT_CATEGORIES;

export const DEFAULT_SETTINGS = {
  storeName: 'TechnicalSky',
  brandWordmark: 'TECHNICALSKY',
  storeTagline: 'TechnicalSky — Curated Product Discoveries',
  currencySymbol: '₹',
  defaultAmazonTag: 'technicalsky-21',
  defaultFlipkartTag: 'technicalsky',
  inquiryEmail: 'contact@technicalsky.com',
  announcementNotice: 'TechnicalSky verified affiliate partner of Amazon & Flipkart',
  activeTheme: 'offwhite-grid',
  customBgUrl: '',
  customBgMobileUrl: '',
  themeMode: 'light',
  glassBlur: 'medium',
  glassOpacity: 'medium',
};

export const DEFAULT_REVIEW_KITS = [];


export const INITIAL_PRODUCTS = [
  {
    id: '6b107683-ac77-4b6b-94a6-e40502093a39',
    name: 'Smart Auto Stop Charging Adapter',
    slug: 'smart-auto-stop-charging-adapter',
    shortDescription: '',
    description: '',
    categoryId: 'electronics',
    category: 'electronics',
    categoryLabel: 'Electronics',
    imageUrl: 'https://res.cloudinary.com/gc7ha4cd/image/upload/v1792819920/sfx4sxbgss1aviykgcue.png',
    displayPrice: '₹999',
    priceAmount: 999,
    priceValue: 999,
    originalPrice: null,
    originalPriceAmount: null,
    verifiedPriceSource: 'Amazon India Prime Verified',
    priceLastVerifiedAt: '2026-10-24T05:33:38.677Z',
    amazonUrl: 'https://www.amazon.in/SWIREUK-Smart-Auto-Charging-Protector/dp/B0H8L8Y54W?dib=eyJ2IjoiMSJ9.ZbGVRgW8LRnM5sBOsy48T1FvPErL5iC9Fxw6jW95ddgJdj_wdOASqjgdN3sY9ITMIyfZf-C1QoezCKSAykqx0cOG9yoJ-HAEhSlcxEJOkUgoiixmVo2jW1iKegA2Wv0nCNeAHRcZKLlus2We500BYCWcntCsDqdCLsW4jvAQAPVHHdtbas-BwJ_VTpp-XrMoBI9bl6uay6BGmVZ10OqYHWrUePjWsZP_WI9W1GEmRYs.q_jzey5uqsOnjiws90MEiG4VEtXWbB2rhwGi1Iqdevw&dib_tag=se&keywords=auto+power+cut+usb&qid=1792139308&sr=8-1-spons&aref=i15pwhcbJQ&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1&ascsubtag=srctok-17eb2a41cb9e9e2f&btn_type=ss&btn_ref=srctok-17eb2a41cb9e9e2f&linkCode=ll2&tag=aakashpal55-21&linkId=888438df24f4db1f7fb79b76ea65207f&ref_=as_li_ss_tl',
    flipkartUrl: '',
    aspectRatio: 'aspect-[4/5]',
    heightClass: 'h-72 sm:h-80 lg:h-[355px]',
    status: 'published',
    isFeatured: false,
    createdAt: '2026-10-24T05:32:12.915Z',
    updatedAt: '2026-10-24T05:33:38.679Z',
  },
  {
    id: '39b14a39-5f96-40ec-9bcb-b2a530825b5a',
    name: 'Mobile Cooler for Gaming',
    slug: 'mobile-cooler-for-gaming',
    shortDescription: '',
    description: '',
    categoryId: 'electronics',
    category: 'electronics',
    categoryLabel: 'Electronics',
    imageUrl: 'https://res.cloudinary.com/gc7ha4cd/image/upload/v1792818785/wgwvsgwwdpgvfkrnntvq.png',
    displayPrice: '₹759',
    priceAmount: 759,
    priceValue: 759,
    originalPrice: '₹1999',
    originalPriceAmount: null,
    verifiedPriceSource: 'Amazon India Prime Verified',
    priceLastVerifiedAt: '2026-10-24T05:33:25.989Z',
    amazonUrl: 'https://www.amazon.in/dp/B0GN94V39W?social_share=cm_sw_r_ud_dp_XJ7CT2ZKJ4ZHMWHE9D5E&th=1&linkCode=sl2&tag=aakashpal55-21&linkId=4edc524c5b7d35282513499c4f8770d6&ref_=as_li_ss_tl&ascsubtag=srctok-1b1a10b794ad1072&btn_type=ss&btn_ref=srctok-1b1a10b794ad1072',
    flipkartUrl: '',
    aspectRatio: 'aspect-[4/5]',
    heightClass: 'h-72 sm:h-80 lg:h-[355px]',
    status: 'published',
    isFeatured: false,
    createdAt: '2026-10-24T05:13:55.714Z',
    updatedAt: '2026-10-24T05:33:25.991Z',
  },
];

// Pure helper function to generate URL-safe slugs
export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

