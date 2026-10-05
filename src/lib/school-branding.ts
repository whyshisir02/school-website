export const BRAND_FIELDS = {
  shortName: { label: "Short school name", max: 60 },
  location: { label: "Location (town, district)", max: 120 },
  subtitle: { label: "Header subtitle", max: 120 },
  motto: { label: "School motto", max: 160 },
  headline: { label: "Homepage headline", max: 160 },
  description: { label: "School description (homepage and search previews)", max: 320 },
  established: { label: "Established year (BS)", max: 4 },
  regdNo: { label: "Registration number", max: 60 },
  facebook: { label: "Facebook page URL", max: 500 },
  youtube: { label: "YouTube channel URL", max: 500 },
  hours: { label: "School / office hours", max: 160 },
  aboutIntro: { label: "About introduction", max: 2000 },
  vision: { label: "Vision", max: 1200 },
  mission: { label: "Mission", max: 1200 },
} as const;
export type BrandField = keyof typeof BRAND_FIELDS;
export type BrandAsset = { url: string; publicId: string };
export type SchoolBranding = Record<BrandField, string> & { logo: BrandAsset | null; signature: BrandAsset | null };
export const EMPTY_BRANDING: SchoolBranding = {
  shortName: "", location: "", subtitle: "", motto: "", headline: "Welcome to our school",
  description: "", established: "", regdNo: "", facebook: "", youtube: "", hours: "",
  aboutIntro: "", vision: "", mission: "", logo: null, signature: null,
};
export function normalizeBranding(raw: unknown): SchoolBranding {
  const r = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
  const result = { ...EMPTY_BRANDING };
  for (const key of Object.keys(BRAND_FIELDS) as BrandField[]) if (typeof r[key] === "string") result[key] = r[key] as string;
  for (const key of ["logo", "signature"] as const) {
    const asset = r[key] as BrandAsset | null;
    if (asset && typeof asset.url === "string" && typeof asset.publicId === "string") result[key] = { url: asset.url, publicId: asset.publicId };
  }
  return result;
}
export function validateBranding(raw: unknown) {
  const data = normalizeBranding(raw);
  const fieldErrors: Record<string, string> = {};
  for (const key of Object.keys(BRAND_FIELDS) as BrandField[]) {
    data[key] = data[key].trim();
    if (data[key].length > BRAND_FIELDS[key].max) fieldErrors[key] = `Use up to ${BRAND_FIELDS[key].max} characters.`;
  }
  if (!data.headline) fieldErrors.headline = "Enter a homepage headline.";
  if (data.established && !/^[12][0-9]{3}$/.test(data.established)) fieldErrors.established = "Enter a four-digit BS year.";
  for (const key of ["facebook", "youtube"] as const) {
    if (!data[key]) continue;
    try { const u = new URL(data[key]); if (u.protocol !== "https:" || u.username || u.password) throw new Error(); }
    catch { fieldErrors[key] = "Enter a complete HTTPS link, or leave blank."; }
  }
  return { data, fieldErrors };
}
export function schoolInitials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "S"; }
