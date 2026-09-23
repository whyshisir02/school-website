/**
 * Canonical origin for the site. Used by metadataBase, robots.txt and
 * sitemap.xml — all three must agree, or search engines get conflicting
 * canonical/sitemap signals.
 *
 * Set NEXT_PUBLIC_SITE_URL in the deploy environment (e.g.
 * "https://easternview.edu.np"). The fallback keeps local dev and builds
 * working without it, but should never be relied on in production: if the
 * school ends up on a different domain, canonical URLs would silently point
 * at the wrong host.
 */
const FALLBACK = "https://easternview.edu.np";

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK;
  // Strip a trailing slash so callers can safely do `${siteUrl()}/path`.
  return raw.replace(/\/+$/, "");
}