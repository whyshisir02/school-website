"use server";
import { auditTransaction } from "@/lib/audit";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { validateSettings } from "@/lib/settings-validation";

export type SaveSettingsResult = { ok: boolean; error?: string; fieldErrors?: Record<string, string> };

const isHttpUrl = (v: string) => /^https?:\/\//i.test(v);
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/** Store contact information; blank optional fields stay empty. */
export async function saveSettings(formData: FormData): Promise<SaveSettingsResult> {
  const session = await requireAdmin("SCHOOL_SETTINGS");

  const schoolName = String(formData.get("schoolName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const mapLink = String(formData.get("mapLink") ?? "").trim();
  const mapEmbed = String(formData.get("mapEmbed") ?? "").trim();

  const fieldErrors = validateSettings({ schoolName, address, phone, email, mapLink, mapEmbed });
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Please check the highlighted fields.", fieldErrors };

  // Stat tiles come in as fixed rows: stat_value_i / stat_label_i / stat_show_i.
  const stats: { value: string; label: string; show: boolean; verified: boolean }[] = [];
  for (let i = 0; i < 8; i++) {
    if (!formData.has(`stat_value_${i}`) && !formData.has(`stat_label_${i}`)) continue;
    const value = String(formData.get(`stat_value_${i}`) ?? "").trim();
    const label = String(formData.get(`stat_label_${i}`) ?? "").trim();
    const show = formData.get(`stat_show_${i}`) === "on";
    if (!value && !label) continue; // skip fully-empty rows
    stats.push({ value: value.slice(0, 20), label: label.slice(0, 40), show, verified: show });
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

  await auditTransaction(session, { action: "SETTINGS_SAVED", targetId: "main" }, (tx) => tx.settings.upsert({
    where: { id: "main" },
    create: { id: "main", ...data },
    update: data,
  }));

  // Purge every cached page under the root layout so TopBar/Footer, the home
  // page, contact and about all pick up the new values immediately.
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  return { ok: true };
}
