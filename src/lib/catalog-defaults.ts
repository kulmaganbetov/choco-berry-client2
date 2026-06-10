import type { Product, SiteSettings } from "@/types";
import { DEFAULT_CATEGORY_LABELS } from "@/types";
import logoAsset from "@/assets/logo.png.asset.json";
import bgDesktopAsset from "@/assets/bg-desktop.png.asset.json";
import bgMobileAsset from "@/assets/bg-mobile.png.asset.json";

export interface CatalogData {
  products: Product[];
  settings: SiteSettings;
}

export const defaultSettings: SiteSettings = {
  whatsapp: "77000000000",
  title: "By Aidanella",
  subtitle: "Искушение в каждом кусочке",
  logo: logoAsset.url,
  bgDesktop: bgDesktopAsset.url,
  bgMobile: bgMobileAsset.url,
  categoryLabels: DEFAULT_CATEGORY_LABELS,
};

export const seedProducts: Product[] = [
  {
    id: "p1",
    name: "Классическая клубника",
    description: "Свежая клубника в бельгийском молочном шоколаде",
    price: 850,
    image: "https://images.unsplash.com/photo-1572383672419-ab35444a6934?w=800&q=80",
    category: "strawberry",
    order: 1,
  },
  {
    id: "p2",
    name: "Розовая мечта",
    description: "Клубника в розовом шоколаде с золотой посыпкой",
    price: 1200,
    image: "https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=800&q=80",
    category: "strawberry",
    order: 2,
  },
  {
    id: "p3",
    name: "Тёмный соблазн",
    description: "Тёмный шоколад 70%, цельная клубника",
    price: 950,
    image: "https://images.unsplash.com/photo-1611059147693-ddf78ef9b32f?w=800&q=80",
    category: "strawberry",
    order: 3,
  },
  {
    id: "p4",
    name: "Малина в шоколаде",
    description: "Свежая малина в белом шоколаде",
    price: 1100,
    image: "https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=800&q=80",
    category: "berries",
    order: 4,
  },
  {
    id: "p5",
    name: "Виноград в шоколаде",
    description: "Чёрный виноград в молочном шоколаде",
    price: 900,
    image: "https://images.unsplash.com/photo-1599785209707-a456fc1337d3?w=800&q=80",
    category: "fruits",
    order: 5,
  },
  {
    id: "p6",
    name: "Подарочный набор Love",
    description: "12 ягод в премиальной коробке с лентой",
    price: 6500,
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&q=80",
    category: "gifts",
    order: 6,
  },
];

export const defaultCatalog: CatalogData = {
  products: seedProducts,
  settings: defaultSettings,
};

export function normalizeCatalog(data: Partial<CatalogData> | undefined): CatalogData {
  return {
    products: data?.products?.length ? data.products : seedProducts,
    settings: {
      ...defaultSettings,
      ...data?.settings,
      logo: data?.settings?.logo ?? defaultSettings.logo,
      categoryLabels: {
        ...DEFAULT_CATEGORY_LABELS,
        ...data?.settings?.categoryLabels,
      },
    },
  };
}
