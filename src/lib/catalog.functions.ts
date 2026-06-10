import { createServerFn } from "@tanstack/react-start";
import type { CatalogData } from "@/lib/catalog-defaults";
import { normalizeCatalog } from "@/lib/catalog-defaults";
import { readCatalogFromDisk, writeCatalogToDisk } from "@/lib/catalog.server";

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  return readCatalogFromDisk();
});

export const saveCatalog = createServerFn({ method: "POST" })
  .validator((data: CatalogData) => normalizeCatalog(data))
  .handler(async ({ data }) => {
    return writeCatalogToDisk(data);
  });
