import { createFileRoute } from "@tanstack/react-router";
import { migrateInlineImages } from "@/lib/migrate.server";

// One-off maintenance endpoint. Open it in the browser to move old inlined
// base64 photos from the catalog JSON into the Image table.
//
//   /api/migrate-images?confirm=yes
//
// The `confirm=yes` guard just prevents crawlers/prefetch from triggering it by
// accident — the operation itself is idempotent and never deletes data. If a
// MIGRATE_SECRET env var is set, the request must instead pass ?key=<secret>.
export const Route = createFileRoute("/api/migrate-images")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const secret = process.env.MIGRATE_SECRET;

        const authorized = secret
          ? url.searchParams.get("key") === secret
          : url.searchParams.get("confirm") === "yes";

        if (!authorized) {
          return Response.json(
            {
              ok: false,
              message: secret
                ? "Добавьте к ссылке ?key=ВАШ_СЕКРЕТ"
                : "Добавьте к ссылке ?confirm=yes для запуска переноса.",
            },
            { status: 401 },
          );
        }

        try {
          const result = await migrateInlineImages();
          return Response.json(result, { status: result.ok ? 200 : 500 });
        } catch (error) {
          return Response.json(
            { ok: false, message: error instanceof Error ? error.message : "Ошибка миграции" },
            { status: 500 },
          );
        }
      },
    },
  },
});
