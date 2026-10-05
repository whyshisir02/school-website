"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { auditTransaction } from "@/lib/audit";
import { BRAND_FIELDS, validateBranding } from "@/lib/school-branding";
import { saveSchoolBranding } from "@/lib/branding-service";

export async function saveBranding(form: FormData) {
  const session = await requireAdmin("SCHOOL_SETTINGS");
  let assets;
  try { assets = JSON.parse(String(form.get("assets") || "{}")); } catch { return { ok: false, error: "Invalid images. Choose the images again." }; }
  const raw = Object.fromEntries(Object.keys(BRAND_FIELDS).map((key) => [key, String(form.get(key) ?? "")]));
  const { data, fieldErrors } = validateBranding({ ...raw, logo: assets?.logo, signature: assets?.signature });
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors };
  try {
    await auditTransaction(session, { action: "SETTINGS_SAVED", targetId: "main" }, async (tx) => {
      await saveSchoolBranding(tx, data);
    });
  } catch (error) { return { ok: false, error: error instanceof Error && !('code' in error) ? error.message : "Branding could not be saved. Please try again." }; }
  revalidatePath("/", "layout");
  return { ok: true };
}
