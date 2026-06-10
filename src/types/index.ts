export type Category =
  | "strawberry"
  | "berries"
  | "fruits"
  | "gifts"
  | "other";

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

export interface SiteSettings {
  whatsapp: string;
  title: string;
  subtitle: string;
  logo: string;
  bgDesktop: string;
  bgMobile: string;
}

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "strawberry", label: "Клубника в шоколаде" },
  { id: "berries", label: "Ягоды в шоколаде" },
  { id: "fruits", label: "Фрукты в шоколаде" },
  { id: "gifts", label: "Подарочные наборы" },
  { id: "other", label: "Другое" },
];
