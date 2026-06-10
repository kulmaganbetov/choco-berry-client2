import { motion } from "framer-motion";
import { CATEGORIES, type Category } from "@/types";

export function CategoryTabs({
  value,
  onChange,
}: {
  value: Category | "all";
  onChange: (c: Category | "all") => void;
}) {
  const items: { id: Category | "all"; label: string }[] = [
    { id: "all", label: "Все" },
    ...CATEGORIES,
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-3">
      {items.map((c) => {
        const active = value === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className="relative px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
          >
            {active && (
              <motion.span
                layoutId="active-tab"
                className="absolute inset-0 btn-luxury rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 ${
                active ? "text-white" : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {c.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
