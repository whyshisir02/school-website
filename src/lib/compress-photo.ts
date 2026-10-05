import {
  IMAGE_TYPES, IMAGE_TARGET_BYTES, IMAGE_MAX_BYTES,
  IMAGE_MAX_SOURCE_BYTES, IMAGE_MAX_DIMENSION,
} from "./image-upload-policy";

/** Compress locally so Cloudinary only receives the smaller stored original. */
export async function compressPhoto(file: File): Promise<File> {
  if (!IMAGE_TYPES.includes(file.type)) {
    throw new Error(`${file.name}: Use JPEG, PNG, or WebP.`);
  }
  if (!file.size || file.size > IMAGE_MAX_SOURCE_BYTES) {
    throw new Error(`${file.name}: Select a non-empty photo up to 20 MB.`);
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
    } catch {
      throw new Error(`${file.name}: This photo could not be read.`);
    }
    const scale = Math.min(1, IMAGE_MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    if (scale === 1 && file.size <= IMAGE_TARGET_BYTES) return file;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Photo compression is unavailable in this browser.");
    let width = Math.max(1, Math.round(image.naturalWidth * scale));
    let height = Math.max(1, Math.round(image.naturalHeight * scale));
    let best: Blob | undefined;
    for (let attempt = 0; attempt < 12; attempt++) {
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(image, 0, 0, width, height);
      for (const quality of [0.9, 0.8, 0.7, 0.6]) {
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Photo compression failed.")), "image/webp", quality);
        });
        if (!best || blob.size < best.size) best = blob;
        if (blob.size <= IMAGE_TARGET_BYTES) {
          return compressedFile(file, blob);
        }
      }
      width = Math.max(1, Math.round(width * 0.85));
      height = Math.max(1, Math.round(height * 0.85));
    }
    if (best && best.size <= IMAGE_MAX_BYTES) return compressedFile(file, best);
    throw new Error(`${file.name}: Could not compress below 700 KB. Please choose a smaller photo.`);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function compressedFile(source: File, blob: Blob): File {
  // Browsers without WebP encoding may return PNG instead.
  if (!IMAGE_TYPES.includes(blob.type)) throw new Error("Unsupported compression format.");
  const extension = blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg";
  return new File([blob], `${source.name.replace(/\.[^.]+$/, "")}.${extension}`, {
    type: blob.type, lastModified: source.lastModified,
  });
}
