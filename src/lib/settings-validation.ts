export function validateSettings(fields: Record<string, string>) {
  const errors: Record<string, string> = {};
  for (const key of ["schoolName", "address", "phone", "email"]) if (!fields[key]?.trim()) errors[key] = "This field is required.";
  if (fields.schoolName.length > 120) errors.schoolName = "Use up to 120 characters.";
  if (fields.address.length > 200) errors.address = "Use up to 200 characters.";
  if (fields.phone.length > 40) errors.phone = "Use up to 40 characters.";
  if (fields.email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errors.email = "Enter a valid email address.";
  if (fields.mapLink && !isHttpUrl(fields.mapLink)) errors.mapLink = "Enter a complete http:// or https:// link.";
  if (fields.mapLink.length > 500) errors.mapLink = "Use up to 500 characters.";
  if (fields.mapEmbed && !isMapsEmbed(fields.mapEmbed)) errors.mapEmbed = "Use a Google Maps embed URL beginning https://www.google.com/maps.";
  if (fields.mapEmbed.length > 500) errors.mapEmbed = "Use up to 500 characters.";
  return errors;
}
function isHttpUrl(value: string) {
  try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
}
export function isMapsEmbed(value: string) {
  try { const url = new URL(value); return url.protocol === "https:" && url.hostname === "www.google.com" && /^\/maps(?:\/|$)/.test(url.pathname); } catch { return false; }
}
