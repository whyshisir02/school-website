/** Hosting configuration, never another school's default domain. */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.NEXTAUTH_URL?.trim() || process.env.URL?.trim() || "http://localhost:3000";
  const url = new URL(raw);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error("Configure a valid school site URL.");
  return url.origin;
}
