"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";

export type SaveSettingsResult = { ok: boolean; error?: string };

const isHttpUrl = (v: string) => /^https?:\/\//i.test(v);
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/**
 * Persist the editable site settings (single row, id="main"). The public site
 * reads these via getSiteSettings() in src/lib/settings.ts, falling back to
 * src/lib/school.ts when a field is blank — so clearing a field safely reverts
 * it to the built-in default rather than showing an empty string.
 */
export async function saveSettings(formData: FormData): Promise<SaveSettingsResult> {
  await requireAdmin();

  const schoolName = String(formData.get("schoolName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const mapLink = String(formData.get("mapLink") ?? "").trim();
  const mapEmbed = String(formData.get("mapEmbed") ?? "").trim();

  if (!schoolName || !address || !phone || !email) {
    return { ok: false, error: "School name, address, phone and email are required." };
  }
  if (schoolName.length > 120 || address.length > 200) {
    return { ok: false, error: "School name or address is too long." };
  }
  if (!isEmail(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (mapLink && !isHttpUrl(mapLink)) {
    return { ok: false, error: "Map link must start with http:// or https://." };
  }
  if (mapEmbed && !isHttpUrl(mapEmbed)) {
    return { ok: false, error: "Map embed URL must start with http:// or https://." };
  }

  // Stat tiles come in as fixed rows: stat_value_i / stat_label_i / stat_show_i.
  const stats: { value: string; label: string; show: boolean }[] = [];
  for (let i = 0; i < 8; i++) {
    if (!formData.has(`stat_value_${i}`) && !formData.has(`stat_label_${i}`)) continue;
    const value = String(formData.get(`stat_value_${i}`) ?? "").trim();
    const label = String(formData.get(`stat_label_${i}`) ?? "").trim();
    const show = formData.get(`stat_show_${i}`) === "on";
    if (!value && !label) continue; // skip fully-empty rows
    stats.push({ value: value.slice(0, 20), label: label.slice(0, 40), show });
  }

  const data = {
    schoolName,
    address,
    phone,
    email,
    mapLink: mapLink || null,
    mapEmbed: mapEmbed || null,
    stats,
  };

  await prisma.settings.upsert({
    where: { id: "main" },
    create: { id: "main", ...data },
    update: data,
  });

  // Purge every cached page under the root layout so TopBar/Footer, the home
  // page, contact and about all pick up the new values immediately.
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  return { ok: true };
}
