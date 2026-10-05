/** A single bounded thumbnail variant; local and other image URLs are unchanged. */
export function galleryThumbnail(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "res.cloudinary.com" || !parsed.pathname.includes("/image/upload/")) return url;
    parsed.pathname = parsed.pathname.replace("/image/upload/", "/image/upload/c_limit,w_640,h_640,q_auto,f_auto/");
    return parsed.toString();
  } catch {
    return url;
  }
}
