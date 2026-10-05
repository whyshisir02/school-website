/** Keep the existing folder unless a separate school's deployment configures its own. */
export function mediaFolder() {
  const folder = process.env.CLOUDINARY_FOLDER?.trim() || "eastern-view";
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(folder)) throw new Error("CLOUDINARY_FOLDER must contain 1-80 letters, numbers, underscores or hyphens.");
  return folder;
}
export function isSchoolUpload(url: string, publicId: string, area: string, cloudName: string) {
  const folder = mediaFolder();
  if (!cloudName || !publicId.startsWith(`${folder}/${area}/`) || !/^[a-zA-Z0-9-]+$/.test(publicId.slice(`${folder}/${area}/`.length))) return false;
  try {
    const u = new URL(url);
    const prefix = `/${cloudName}/image/upload/`;
    return u.protocol === "https:" && u.hostname === "res.cloudinary.com" && !u.port && !u.username && !u.password && !u.search && !u.hash && u.pathname.startsWith(prefix) &&
      new RegExp("^(?:v[0-9]+/)?" + publicId + "\\.(?:webp|png|jpg|jpeg)$").test(u.pathname.slice(prefix.length));
  } catch { return false; }
}
