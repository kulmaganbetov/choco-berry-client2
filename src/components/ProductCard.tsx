import { motion } from "framer-motion";
import type { Product } from "@/types";
import { buildWhatsAppLink, formatPrice } from "@/utils";
import { useStore } from "@/store/useStore";

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const phone = useStore((s) => s.settings.whatsapp);
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ y: -6 }}
      className="glass-card rounded-3xl overflow-hidden group flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rose-deep/30 via-transparent to-transparent" />
      </div>
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground leading-tight">{product.name}</h3>
          {product.description && (
            <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-2xl font-display font-semibold text-gradient-rose">
            {formatPrice(product.price)}
          </span>
          <a
            href={buildWhatsAppLink(phone, product)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-luxury px-5 py-2.5 rounded-full text-sm font-medium tracking-wide"
          >
            Заказать
          </a>
        </div>
      </div>
    </motion.article>
  );
}
