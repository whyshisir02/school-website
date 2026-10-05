import { IMAGE_TYPES, IMAGE_MAX_BYTES, IMAGE_MAX_SOURCE_BYTES } from "./image-upload-policy";

export function portraitCrop(width: number, height: number, zoom: number, x: number, y: number) {
  const safeZoom = Math.max(1, Math.min(3, Number.isFinite(zoom) ? zoom : 1));
  const side = Math.min(width, height) / safeZoom;
  return { sx: (width - side) * Math.max(0, Math.min(100, x)) / 100, sy: (height - side) * Math.max(0, Math.min(100, y)) / 100, side };
}
export async function loadPortrait(file: File): Promise<HTMLImageElement> {
  if (!IMAGE_TYPES.includes(file.type) || !file.size || file.size > IMAGE_MAX_SOURCE_BYTES) throw new Error("Choose JPEG, PNG or WebP up to 20 MB.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } catch { throw new Error("This photo could not be opened. Choose another image."); }
  finally { URL.revokeObjectURL(url); }
}
export function drawPortrait(canvas: HTMLCanvasElement, image: HTMLImageElement, zoom: number, x: number, y: number, size: number) {
  const crop = portraitCrop(image.naturalWidth, image.naturalHeight, zoom, x, y);
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Photo cropping is unavailable in this browser.");
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, size, size);
  ctx.drawImage(image, crop.sx, crop.sy, crop.side, crop.side, 0, 0, size, size);
}
export async function croppedPortrait(image: HTMLImageElement, zoom: number, x: number, y: number): Promise<File> {
  const canvas = document.createElement("canvas");
  const crop = portraitCrop(image.naturalWidth, image.naturalHeight, zoom, x, y);
  drawPortrait(canvas, image, zoom, x, y, Math.max(1, Math.min(600, Math.floor(crop.side))));
  let best: Blob | undefined;
  for (const quality of [0.9, 0.8, 0.7, 0.6]) {
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => b ? resolve(b) : reject(new Error("Photo compression failed.")), "image/webp", quality));
    if (!best || blob.size < best.size) best = blob;
    if (blob.size <= 250_000) break;
  }
  if (!best || best.size > IMAGE_MAX_BYTES) throw new Error("This photo could not be compressed. Please choose another.");
  return new File([best], best.type === "image/webp" ? "portrait.webp" : "portrait.png", { type: best.type });
}
