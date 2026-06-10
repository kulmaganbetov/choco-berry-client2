export type Category = "strawberry" | "berries" | "fruits" | "gifts" | "other";

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  category: Category;
  hidden?: boolean;
  order: number;
}

export type CategoryLabels = Record<Category, string>;

export interface SiteSettings {
  whatsapp: string;
  title: string;
  subtitle: string;
  logo: string;
  bgDesktop: string;
  bgMobile: string;
  categoryLabels: CategoryLabels;
}

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "strawberry", label: "Клубника в шоколаде" },
  { id: "berries", label: "Ягоды в шоколаде" },
  { id: "gifts", label: "Подарочные наборы" },
  { id: "other", label: "Другое" },
];

export const DEFAULT_CATEGORY_LABELS: CategoryLabels = CATEGORIES.reduce(
  (labels, category) => ({ ...labels, [category.id]: category.label }),
  {} as CategoryLabels,
);

export function getCategoryLabel(labels: Partial<CategoryLabels> | undefined, category: Category) {
  return labels?.[category] ?? DEFAULT_CATEGORY_LABELS[category];
}
