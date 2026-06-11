// One-off migration: move any base64 data-URL images that are still inlined in
// the catalog JSON into the Image table, replacing them with short
// "/api/image/{id}" references. Safe to run repeatedly — images that are
// already short URLs (or external https URLs) are skipped, so re-running does
// nothing and never duplicates rows. Never deletes anything.

import type { CatalogData } from "@/lib/catalog-defaults";
import { saveImage } from "@/lib/image.server";

const CATALOG_ID = 1;

export interface MigrationResult {
  ok: boolean;
  message: string;
  migrated: number;
  scanned: number;
}

const isDataUrl = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("data:");

export async function migrateInlineImages(): Promise<MigrationResult> {
  if (!process.env.DATABASE_URL) {
    return {
      ok: false,
      message: "Нет подключения к базе данных (DATABASE_URL не задан).",
      migrated: 0,
      scanned: 0,
    };
  }

  const { prisma } = await import("@/lib/prisma");

  const row = await prisma.catalog.findUnique({ where: { id: CATALOG_ID } });
  if (!row) {
    return { ok: true, message: "Каталог пуст — переносить нечего.", migrated: 0, scanned: 0 };
  }

  // Work on the raw stored object so we never accidentally overwrite real data
  // with defaults (which a normalized read could do on a transient error).
  const catalog = row.data as CatalogData;
  let migrated = 0;
  let scanned = 0;

  for (const product of catalog.products ?? []) {
    scanned++;
    if (isDataUrl(product.image)) {
      product.image = await saveImage(product.image);
      migrated++;
    }
  }

  const settings = catalog.settings;
  if (settings) {
    for (const key of ["logo", "bgDesktop", "bgMobile"] as const) {
      scanned++;
      if (isDataUrl(settings[key])) {
        settings[key] = await saveImage(settings[key]);
        migrated++;
      }
    }
  }

  if (migrated > 0) {
    await prisma.catalog.update({
      where: { id: CATALOG_ID },
      data: { data: catalog as object },
    });
  }

  return {
    ok: true,
    message:
      migrated > 0
        ? `Готово. Перенесено фото: ${migrated}. Каталог обновлён.`
        : "Готово. Старых base64-фото не найдено — переносить нечего.",
    migrated,
    scanned,
  };
}
