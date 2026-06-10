import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { defaultCatalog, normalizeCatalog, type CatalogData } from "@/lib/catalog-defaults";

const isDatabaseEnabled = !!process.env.DATABASE_URL;
const CATALOG_ID = 1;

const catalogFilePath =
  process.env.AIDANELLA_CATALOG_FILE ?? join(process.cwd(), ".data", "catalog.json");

export async function readCatalogFromDisk(): Promise<CatalogData> {
  if (isDatabaseEnabled) {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.catalog.findUnique({ where: { id: CATALOG_ID } });
    if (!row) return defaultCatalog;
    return normalizeCatalog(row.data as Partial<CatalogData>);
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

  if (isDatabaseEnabled) {
    const { prisma } = await import("@/lib/prisma");
    await prisma.catalog.upsert({
      where: { id: CATALOG_ID },
      create: { id: CATALOG_ID, data: catalog as object },
      update: { data: catalog as object },
    });
    return catalog;
  }

  await mkdir(dirname(catalogFilePath), { recursive: true });
  await writeFile(catalogFilePath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  return catalog;
}
