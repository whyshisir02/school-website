import { existsSync, readFileSync } from "fs";
import path from "path";

/**
 * Optional real school logo. Mirrors the switch already used by the notice
 * letterhead in app/(public)/notices/[slug]/page.tsx — drop a file at
 * public/images/logo.png and the favicon, Apple touch icon and social-share
 * image all pick it up with no code change. Until then every one of them falls
 * back to the generated "EV" monogram.
 */
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

/**
 * Same logo, but as a data URI. next/og renders in an isolated context that
 * cannot resolve a relative "/images/logo.png" path or read the filesystem, so
 * the bytes have to be inlined. Returns null when no logo exists.
 */
export function logoDataUri(): string | null {
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