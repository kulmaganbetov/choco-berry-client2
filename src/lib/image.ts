// Client-side image compression. Uploaded photos are stored inline (as data
// URLs) inside the catalog JSON, so keeping them small is what makes saving
// fast. We downscale to a sane max dimension and re-encode as WebP/JPEG.

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to decode image"));
    img.src = src;
  });
}

export async function fileToCompressedDataUrl(
  file: File,
  { maxDim = 1280, quality = 0.82 }: { maxDim?: number; quality?: number } = {},
): Promise<string> {
  // Vector / non-raster images can't be drawn to a canvas meaningfully — keep
  // them as-is (they're already tiny).
  if (!/^image\/(png|jpe?g|webp|bmp)$/i.test(file.type)) {
    return readAsDataUrl(file);
  }

  try {
    const original = await readAsDataUrl(file);
    const img = await loadImage(original);

    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return original;

    ctx.drawImage(img, 0, 0, width, height);

    const webp = canvas.toDataURL("image/webp", quality);
    const compressed = webp.startsWith("data:image/webp")
      ? webp
      : canvas.toDataURL("image/jpeg", quality);

    // Only use the compressed version if it actually came out smaller.
    return compressed.length < original.length ? compressed : original;
  } catch {
    // If anything goes wrong, fall back to the raw file so uploads never break.
    return readAsDataUrl(file);
  }
}
