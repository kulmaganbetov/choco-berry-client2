import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import {
  CATEGORIES,
  getCategoryLabel,
  type Category,
  type Product,
  type SiteSettings,
} from "@/types";
import { formatPrice } from "@/utils";
import { fileToCompressedDataUrl } from "@/lib/image";
import { uploadImage } from "@/lib/image.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Админ — By Aidanella" }, { name: "robots", content: "noindex" }],
  }),
  component: Admin,
});

function Admin() {
  const isAuthed = useStore((s) => s.isAuthed);
  return isAuthed ? <Dashboard /> : <Login />;
}

function Login() {
  const login = useStore((s) => s.login);
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blush via-background to-rose/30">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!login(u, p)) setErr("Неверный логин или пароль");
        }}
        className="glass-card rounded-3xl p-8 w-full max-w-sm space-y-5"
      >
        <div className="text-center">
          <h1 className="font-script text-4xl text-gradient-rose">Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">By Aidanella</p>
        </div>
        <Field label="Логин" value={u} onChange={setU} />
        <Field label="Пароль" type="password" value={p} onChange={setP} />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button className="btn-luxury w-full py-3 rounded-full font-medium">Войти</button>
        <Link
          to="/"
          className="block text-center text-xs text-muted-foreground hover:text-foreground"
        >
          ← На главную
        </Link>
      </motion.form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-4 py-2.5 rounded-xl bg-white/60 border border-border focus:border-rose-deep focus:outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

type Tab = "products" | "settings";

function Dashboard() {
  const {
    products,
    settings,
    logout,
    isSyncing,
    saveError,
    loadCatalog,
    addProduct,
    updateProduct,
    deleteProduct,
    reorder,
    updateSettings,
  } = useStore();
  const categoryLabels = settings.categoryLabels;
  const [tab, setTab] = useState<Tab>("products");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const sorted = [...products].sort((a, b) => a.order - b.order);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush via-background to-rose/20 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-script text-4xl text-gradient-rose">Админ панель</h1>
            <p className="text-sm text-muted-foreground">Управление меню и сайтом</p>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="glass-panel px-4 py-2 rounded-full text-sm">
              Сайт
            </Link>
            <button onClick={logout} className="btn-luxury px-4 py-2 rounded-full text-sm">
              Выйти
            </button>
          </div>
        </header>

        {(isSyncing || saveError) && (
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
            {isSyncing && <span className="text-muted-foreground">Сохранение…</span>}
            {saveError && (
              <span className="text-destructive">Ошибка синхронизации: {saveError}</span>
            )}
          </div>
        )}

        <div className="glass-panel rounded-full p-1.5 inline-flex mb-6">
          {(["products", "settings"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                tab === t ? "btn-luxury text-white" : "text-foreground/60"
              }`}
            >
              {t === "products" ? "Товары" : "Настройки сайта"}
            </button>
          ))}
        </div>

        {tab === "products" && (
          <div className="space-y-3">
            <button
              onClick={() => setCreating(true)}
              className="btn-gold px-5 py-2.5 rounded-full text-sm font-medium"
            >
              + Добавить товар
            </button>
            <div className="grid gap-3 mt-4">
              {sorted.map((p) => (
                <div
                  key={p.id}
                  className="glass-card rounded-2xl p-4 flex flex-wrap gap-4 items-center"
                >
                  <img src={p.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{p.name}</h3>
                      {p.hidden && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted">скрыт</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(p.price)} · {getCategoryLabel(categoryLabels, p.category)}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <IconBtn onClick={() => reorder(p.id, -1)}>↑</IconBtn>
                    <IconBtn onClick={() => reorder(p.id, 1)}>↓</IconBtn>
                    <IconBtn onClick={() => updateProduct(p.id, { hidden: !p.hidden })}>
                      {p.hidden ? "👁" : "🙈"}
                    </IconBtn>
                    <IconBtn onClick={() => setEditing(p)}>✎</IconBtn>
                    <IconBtn
                      onClick={() => {
                        if (confirm("Удалить товар?")) deleteProduct(p.id);
                      }}
                    >
                      🗑
                    </IconBtn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "settings" && <SettingsForm settings={settings} update={updateSettings} />}

        <AnimatePresence>
          {(editing || creating) && (
            <ProductModal
              product={editing}
              categoryLabels={categoryLabels}
              onClose={() => {
                setEditing(null);
                setCreating(false);
              }}
              onSave={(data) => {
                if (editing) updateProduct(editing.id, data);
                else addProduct(data as Omit<Product, "id" | "order">);
                setEditing(null);
                setCreating(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-9 h-9 rounded-full glass-panel hover:bg-white/80 transition text-sm"
    >
      {children}
    </button>
  );
}

function ProductModal({
  product,
  categoryLabels,
  onClose,
  onSave,
}: {
  product: Product | null;
  categoryLabels: SiteSettings["categoryLabels"];
  onClose: () => void;
  onSave: (p: Partial<Product>) => void;
}) {
  const [form, setForm] = useState<Partial<Product>>(
    product ?? {
      name: "",
      price: 0,
      image: "",
      category: "strawberry" as Category,
      description: "",
    },
  );

  const [uploading, setUploading] = useState(false);

  const handleImage = async (file: File) => {
    setUploading(true);
    const dataUrl = await fileToCompressedDataUrl(file);
    try {
      // Store the file in the DB and keep only a short URL in the catalog.
      const { url } = await uploadImage({ data: { dataUrl } });
      setForm((prev) => ({ ...prev, image: url }));
    } catch {
      // If the upload endpoint is unavailable, fall back to the inline data
      // URL so the admin can still save (degraded, but never broken).
      setForm((prev) => ({ ...prev, image: dataUrl }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-4"
      >
        <h2 className="font-display text-2xl">{product ? "Редактировать" : "Новый товар"}</h2>
        <Field
          label="Название"
          value={form.name ?? ""}
          onChange={(v) => setForm({ ...form, name: v })}
        />
        <Field
          label="Цена (₸)"
          type="number"
          value={String(form.price ?? "")}
          onChange={(v) => setForm({ ...form, price: Number(v) })}
        />
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Категория</span>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
            className="mt-1 w-full px-4 py-2.5 rounded-xl bg-white/60 border border-border"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {getCategoryLabel(categoryLabels, c.id)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Описание</span>
          <textarea
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="mt-1 w-full px-4 py-2.5 rounded-xl bg-white/60 border border-border"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Фото (URL или загрузить)
          </span>
          <input
            value={form.image ?? ""}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="https://..."
            className="mt-1 w-full px-4 py-2.5 rounded-xl bg-white/60 border border-border"
          />
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImage(file);
            }}
            className="mt-2 text-xs disabled:opacity-50"
          />
          {uploading && <p className="mt-1 text-xs text-muted-foreground">Загрузка фото…</p>}
          {form.image && (
            <img src={form.image} alt="" className="mt-2 w-full h-40 object-cover rounded-xl" />
          )}
        </label>
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full glass-panel">
            Отмена
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.name || !form.image || !form.price}
            className="flex-1 btn-luxury py-2.5 rounded-full disabled:opacity-50"
          >
            Сохранить
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SettingsForm({
  settings,
  update,
}: {
  settings: SiteSettings;
  update: (s: Partial<SiteSettings>) => void;
}) {
  const [form, setForm] = useState(settings);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  // When the store loads fresh data from the server (async after mount),
  // sync the local form so we don't overwrite server data on next save.
  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleFile = async (key: "logo" | "bgDesktop" | "bgMobile", file: File) => {
    // Backgrounds can be a bit larger/higher quality than product thumbnails.
    const maxDim = key === "logo" ? 512 : 1920;
    setUploadingKey(key);
    const dataUrl = await fileToCompressedDataUrl(file, { maxDim });
    try {
      // Store the file in the DB and keep only a short URL in the settings.
      const { url } = await uploadImage({ data: { dataUrl } });
      setForm((prev) => ({ ...prev, [key]: url }));
    } catch {
      // Fall back to the inline data URL if the upload endpoint is unavailable.
      setForm((prev) => ({ ...prev, [key]: dataUrl }));
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 space-y-4 max-w-2xl">
      <Field
        label="WhatsApp номер"
        value={form.whatsapp}
        onChange={(v) => setForm({ ...form, whatsapp: v })}
      />
      <Field
        label="Заголовок сайта"
        value={form.title}
        onChange={(v) => setForm({ ...form, title: v })}
      />
      <Field
        label="Подзаголовок"
        value={form.subtitle}
        onChange={(v) => setForm({ ...form, subtitle: v })}
      />

      <div className="border-t border-border pt-4 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Названия категорий
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Эти названия отображаются на сайте и в выборе категории товара.
          </p>
        </div>
        <Field label="Все товары" value="Все" onChange={() => undefined} disabled />
        {CATEGORIES.map((category) => (
          <Field
            key={category.id}
            label={category.label}
            value={getCategoryLabel(form.categoryLabels, category.id)}
            onChange={(value) =>
              setForm({
                ...form,
                categoryLabels: {
                  ...form.categoryLabels,
                  [category.id]: value,
                },
              })
            }
          />
        ))}
      </div>

      {(["logo", "bgDesktop", "bgMobile"] as const).map((key) => (
        <div key={key} className="border-t border-border pt-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {key === "logo" ? "Логотип" : key === "bgDesktop" ? "Фон Desktop" : "Фон Mobile"}
          </p>
          <img src={form[key]} alt="" className="w-32 h-20 object-cover rounded-lg mb-2" />
          <input
            type="file"
            accept="image/*"
            disabled={uploadingKey === key}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(key, file);
            }}
            className="text-xs disabled:opacity-50"
          />
          {uploadingKey === key && <p className="mt-1 text-xs text-muted-foreground">Загрузка…</p>}
        </div>
      ))}

      <button
        onClick={() => update(form)}
        className="btn-luxury px-6 py-3 rounded-full font-medium w-full"
      >
        Сохранить настройки
      </button>
    </div>
  );
}
