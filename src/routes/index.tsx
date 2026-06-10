import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useStore, filterByCategory } from "@/store/useStore";
import { ProductCard } from "@/components/ProductCard";
import { ProductSkeleton } from "@/components/ProductSkeleton";
import { CategoryTabs } from "@/components/CategoryTabs";
import type { Category } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "By Aidanella — Клубника в шоколаде | Премиум десерты" },
      { name: "description", content: "By Aidanella — премиальная клубника и ягоды в бельгийском шоколаде. Заказ через WhatsApp." },
      { property: "og:title", content: "By Aidanella — Искушение в каждом кусочке" },
      { property: "og:description", content: "Премиальная клубника в шоколаде ручной работы. Доставка и подарочные наборы." },
    ],
  }),
  component: Home,
});

function Home() {
  const products = useStore((s) => s.products);
  const settings = useStore((s) => s.settings);
  const [cat, setCat] = useState<Category | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const visible = useMemo(() => filterByCategory(products, cat), [products, cat]);

  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen relative">
      {/* Backgrounds */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat hidden md:block"
        style={{ backgroundImage: `url(${settings.bgDesktop})` }}
        aria-hidden
      />
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat md:hidden"
        style={{ backgroundImage: `url(${settings.bgMobile})` }}
        aria-hidden
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-blush/30 via-transparent to-blush/60" aria-hidden />

      {/* Admin link (subtle) */}
      <Link
        to="/admin"
        className="fixed top-4 right-4 z-50 glass-panel rounded-full px-3 py-1.5 text-xs text-foreground/60 hover:text-foreground transition"
      >
        Admin
      </Link>

      {/* HERO */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          className="text-center max-w-2xl"
        >
          <motion.img
            src={settings.logo}
            alt="By Aidanella"
            className="mx-auto w-44 md:w-60 drop-shadow-[0_8px_30px_rgba(217,122,151,0.35)]"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
          />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="mt-6 font-script text-5xl md:text-7xl text-gradient-rose"
          >
            {settings.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-4 text-lg md:text-xl text-foreground/75 font-light tracking-wide"
          >
            {settings.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.8 }}
            className="mt-10"
          >
            <button
              onClick={scrollToMenu}
              className="btn-luxury px-9 py-4 rounded-full text-base font-medium tracking-wide"
            >
              Посмотреть меню
            </button>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="mt-16 text-foreground/40 text-xs uppercase tracking-[0.3em]"
          >
            scroll
          </motion.div>
        </motion.div>
      </section>

      {/* MENU */}
      <section id="menu" className="px-4 pb-24 pt-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-gold uppercase tracking-[0.4em] text-xs mb-3">Menu</p>
            <h2 className="font-script text-5xl md:text-6xl text-gradient-rose">
              Наша коллекция
            </h2>
            <div className="mt-4 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          </motion.div>

          <div className="mb-10 glass-panel rounded-full p-2 mx-auto inline-flex max-w-full overflow-x-auto md:flex md:justify-center w-full md:w-auto">
            <CategoryTabs value={cat} onChange={setCat} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
              : visible.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>

          {!loading && visible.length === 0 && (
            <p className="text-center text-muted-foreground py-16">
              В этой категории пока нет товаров
            </p>
          )}
        </div>

        <footer className="mt-20 text-center text-sm text-foreground/50">
          © {new Date().getFullYear()} {settings.title} · since 2020
        </footer>
      </section>
    </div>
  );
}
