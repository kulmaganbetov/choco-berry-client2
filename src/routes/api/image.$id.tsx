import { createFileRoute } from "@tanstack/react-router";
import { getImage } from "@/lib/image.server";

// Serves an uploaded photo by id. Image ids are content-stable and unique, so
// responses are cached aggressively — the database is hit at most once per
// image, after which the CDN/browser serve it.
export const Route = createFileRoute("/api/image/$id")({
  server: {
    handlers: {
      GET: async ({ params }: { params: { id: string } }) => {
        const image = await getImage(params.id);
        if (!image) {
          return new Response("Not found", { status: 404 });
        }

        return new Response(new Uint8Array(image.data), {
          status: 200,
          headers: {
            "content-type": image.mimeType,
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
