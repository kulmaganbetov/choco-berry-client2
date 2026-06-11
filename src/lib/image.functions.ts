import { createServerFn } from "@tanstack/react-start";
import { saveImage } from "@/lib/image.server";

// Uploads a single (already client-compressed) image as a base64 data URL and
// returns a short "/api/image/{id}" reference to store in the catalog.
//
// One image per request stays comfortably under Vercel's 4.5 MB body limit —
// unlike the old flow, which resent every photo inside one catalog save.
export const uploadImage = createServerFn({ method: "POST" })
  .inputValidator((data: { dataUrl: string }) => {
    if (!data || typeof data.dataUrl !== "string" || data.dataUrl.length === 0) {
      throw new Error("dataUrl is required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const url = await saveImage(data.dataUrl);
    return { url };
  });
