import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { defaultCatalog, normalizeCatalog, type CatalogData } from "@/lib/catalog-defaults";

const isKVEnabled = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const CATALOG_KEY = "catalog";

const catalogFilePath =
  process.env.AIDANELLA_CATALOG_FILE ?? join(process.cwd(), ".data", "catalog.json");

export async function readCatalogFromDisk(): Promise<CatalogData> {
  if (isKVEnabled) {
    const { kv } = await import("@vercel/kv");
    const data = await kv.get<CatalogData>(CATALOG_KEY);
    return data ? normalizeCatalog(data) : defaultCatalog;
  }

  try {
    const raw = await readFile(catalogFilePath, "utf8");
    return normalizeCatalog(JSON.parse(raw) as Partial<CatalogData>);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return defaultCatalog;
    }
    throw error;
  }
}

export async function writeCatalogToDisk(data: CatalogData): Promise<CatalogData> {
  const catalog = normalizeCatalog(data);

  if (isKVEnabled) {
    const { kv } = await import("@vercel/kv");
    await kv.set(CATALOG_KEY, catalog);
    return catalog;
  }

  await mkdir(dirname(catalogFilePath), { recursive: true });
  await writeFile(catalogFilePath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  return catalog;
}
