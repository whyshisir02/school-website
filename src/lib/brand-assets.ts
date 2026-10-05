import { existsSync, readFileSync } from "fs";
import { isSchoolUpload } from "./media-folder";
import type { BrandAsset } from "./school-branding";
import path from "path";

/** Render only this school's saved logo; no implicit local fallback. */
export const LOGO_PATH = path.join(process.cwd(), "public", "images", "logo.png");

export function hasLogo(): boolean {
  return existsSync(LOGO_PATH);
}

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

/** Render only this school's saved logo; no implicit local fallback. */
export async function logoDataUri(asset: BrandAsset | null): Promise<string | null> {
  if (!asset) return null;
  if (asset.publicId) {
    try {
      if (!isSchoolUpload(asset.url, asset.publicId, "branding", process.env.CLOUDINARY_CLOUD_NAME || "")) return null;
      const response = await fetch(asset.url, { redirect: "error", signal: AbortSignal.timeout(5000), cache: "no-store" });
      const mime = response.headers.get("content-type")?.split(";")[0];
      if (!response.ok || !mime || !["image/png", "image/webp", "image/jpeg"].includes(mime)) return null;
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length > 700_000) return null;
      return `data:${mime};base64,${bytes.toString("base64")}`;
    } catch { return null; }
  }
  if (asset.url !== "/images/logo.png") return null;
  if (!hasLogo()) return null;
  try {
    const bytes = readFileSync(LOGO_PATH);
    return `data:${MIME_BY_EXT[path.extname(LOGO_PATH).toLowerCase()] ?? "image/png"};base64,${bytes.toString("base64")}`;
  } catch {
    // Unreadable/corrupt file — fall back to the monogram rather than 500 the
    // icon route, which would break the tab icon sitewide.
    return null;
  }
}
