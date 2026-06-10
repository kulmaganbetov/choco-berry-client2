import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Product, type SiteSettings, type Category } from "@/types";
import { defaultSettings, seedProducts, type CatalogData } from "@/lib/catalog-defaults";
import { getCatalog, saveCatalog as saveCatalogToServer } from "@/lib/catalog.functions";

type PersistedAppState = Partial<Pick<AppState, "isAuthed">>;

interface AppState {
  products: Product[];
  settings: SiteSettings;
  isAuthed: boolean;
  isSyncing: boolean;
  saveError?: string;
  login: (u: string, p: string) => boolean;
  logout: () => void;
  loadCatalog: () => Promise<void>;
  saveCatalog: () => Promise<void>;
  addProduct: (p: Omit<Product, "id" | "order">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  reorder: (id: string, dir: -1 | 1) => void;
  updateSettings: (s: Partial<SiteSettings>) => void;
}

const getCurrentCatalog = (state: AppState): CatalogData => ({
  products: state.products,
  settings: state.settings,
});

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Не удалось синхронизировать изменения";

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: seedProducts,
      settings: defaultSettings,
      isAuthed: false,
      isSyncing: false,
      saveError: undefined,
      login: (u, p) => {
        const ok = u === "admin" && p === "admin";
        if (ok) set({ isAuthed: true });
        return ok;
      },
      logout: () => set({ isAuthed: false }),
      loadCatalog: async () => {
        set({ isSyncing: true, saveError: undefined });

        try {
          const serverCatalog = await getCatalog();

          set({
            products: serverCatalog.products,
            settings: serverCatalog.settings,
            isSyncing: false,
          });
        } catch (error) {
          set({ isSyncing: false, saveError: getErrorMessage(error) });
        }
      },
      saveCatalog: async () => {
        set({ isSyncing: true, saveError: undefined });

        try {
          const catalog = await saveCatalogToServer({ data: getCurrentCatalog(get()) });
          set({ products: catalog.products, settings: catalog.settings, isSyncing: false });
        } catch (error) {
          set({ isSyncing: false, saveError: getErrorMessage(error) });
        }
      },
      addProduct: (p) => {
        const products = get().products;
        const maxOrder = Math.max(0, ...products.map((x) => x.order));
        set({
          products: [...products, { ...p, id: crypto.randomUUID(), order: maxOrder + 1 }],
        });
        void get().saveCatalog();
      },
      updateProduct: (id, p) => {
        set({ products: get().products.map((x) => (x.id === id ? { ...x, ...p } : x)) });
        void get().saveCatalog();
      },
      deleteProduct: (id) => {
        set({ products: get().products.filter((x) => x.id !== id) });
        void get().saveCatalog();
      },
      reorder: (id, dir) => {
        const products = [...get().products].sort((a, b) => a.order - b.order);
        const idx = products.findIndex((x) => x.id === id);
        const swapIdx = idx + dir;
        if (idx < 0 || swapIdx < 0 || swapIdx >= products.length) return;
        const a = products[idx].order;
        products[idx].order = products[swapIdx].order;
        products[swapIdx].order = a;
        set({ products: [...products] });
        void get().saveCatalog();
      },
      updateSettings: (s) => {
        set({ settings: { ...get().settings, ...s } });
        void get().saveCatalog();
      },
    }),
    {
      name: "aidanella-store",
      version: 4,
      partialize: (state) => ({ isAuthed: state.isAuthed }),
      migrate: (persisted: unknown) => {
        const state = persisted as PersistedAppState;

        return { isAuthed: Boolean(state?.isAuthed) };
      },
    },
  ),
);

export const filterByCategory = (products: Product[], cat: Category | "all") =>
  products
    .filter((p) => !p.hidden)
    .filter((p) => (cat === "all" ? true : p.category === cat))
    .sort((a, b) => a.order - b.order);
