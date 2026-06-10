import type { Product } from "@/types";

export function buildWhatsAppLink(phone: string, product: Product) {
  const text = `Здравствуйте, хочу заказать:\n\n${product.name}\nЦена: ${product.price} ₸`;
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export function formatPrice(n: number) {
  return `${n.toLocaleString("ru-RU")} ₸`;
}

export const CURRENCY = "₸";
