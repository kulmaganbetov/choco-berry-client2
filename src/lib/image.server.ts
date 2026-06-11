// Server-side image storage. Uploaded photos are persisted as binary rows in
// the database (the Image table) and referenced from the catalog by a short
// "/api/image/{id}" URL. This replaces inlining base64 data URLs into the
// catalog JSON, which made every catalog save resend every photo and tripped
// Vercel's 4.5 MB request-body limit (HTTP 413).

const isDatabaseEnabled = !!process.env.DATABASE_URL;

const DATA_URL_RE = /^data:([^;,]+)(;base64)?,(.*)$/s;

export interface StoredImage {
  mimeType: string;
  data: Uint8Array;
}

/**
 * Persist a base64 data URL and return a short "/api/image/{id}" reference.
 *
 * Falls back to returning the input unchanged when:
 *  - there is no database configured (local file mode), or
 *  - the input is not a data URL (e.g. an external https URL or an existing
 *    "/api/image/..." reference) — nothing to store.
 *
 * This keeps existing base64 / URL images working with zero migration.
 */
export async function saveImage(input: string): Promise<string> {
  if (!isDatabaseEnabled) return input;

  const match = DATA_URL_RE.exec(input);
  if (!match) return input;

  const mimeType = match[1] || "application/octet-stream";
  const isBase64 = !!match[2];
  const payload = match[3] ?? "";

  const data = isBase64
    ? Buffer.from(payload, "base64")
    : Buffer.from(decodeURIComponent(payload), "utf8");

  const id = crypto.randomUUID();
  const { prisma } = await import("@/lib/prisma");
  await prisma.image.create({ data: { id, mimeType, data } });

  return `/api/image/${id}`;
}

export async function getImage(id: string): Promise<StoredImage | null> {
  if (!isDatabaseEnabled) return null;

  const { prisma } = await import("@/lib/prisma");
  const row = await prisma.image.findUnique({ where: { id } });
  if (!row) return null;

  return { mimeType: row.mimeType, data: row.data as Uint8Array };
}
