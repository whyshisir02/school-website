"use client";
import { useState } from "react";
import Image from "next/image";
import { BRAND_FIELDS, type SchoolBranding } from "@/lib/school-branding";
import { compressPhoto } from "@/lib/compress-photo";
import { uploadPhoto } from "@/lib/upload-photo";
import { saveBranding } from "@/app/admin/(panel)/settings/branding/actions";
import { useSettingsSave } from "./useSettingsSave";
import SaveBar from "./SaveBar";
import UnsavedChangesGuard from "./UnsavedChangesGuard";

export default function BrandingForm({ branding }: { branding: SchoolBranding }) {
  const state = useSettingsSave(saveBranding);
  const [assets, setAssets] = useState({ logo: branding.logo, signature: branding.signature });
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState("");
  async function upload(key: "logo" | "signature", file: File) {
    setBusy(true); setUploadError("");
    try {
      const photo = await compressPhoto(file);
      const form = new FormData(); form.append("file", photo);
      const result = await uploadPhoto("/api/admin/branding/upload", form, () => {});
      if (!result.url || !result.publicId) throw new Error("The upload response was incomplete.");
      setAssets((old) => ({ ...old, [key]: { url: result.url!, publicId: result.publicId! } })); state.markDirty();
    } catch (error) { setUploadError(error instanceof Error ? error.message : "Upload failed."); }
    finally { setBusy(false); }
  }
  return <form key={state.resetKey} onChange={state.markDirty} onSubmit={(event) => { event.preventDefault(); if (busy) return; const form = new FormData(event.currentTarget); form.set("assets", JSON.stringify(assets)); void state.save(form); }} className="mt-6 space-y-6">
    <UnsavedChangesGuard dirty={state.dirty || busy} />
    <fieldset disabled={busy || state.pending} className="grid gap-6 rounded-2xl border bg-white p-5 sm:grid-cols-2">
      {(["logo", "signature"] as const).map((key) => <div key={key} className="space-y-3">
        <h3 className="font-semibold capitalize">{key === "signature" ? "Principal signature (optional, published on notices)" : "School logo"}</h3>
        {assets[key] && <Image src={assets[key]!.url} alt={`${key} preview`} width={160} height={100} className="h-24 w-40 object-contain" />}
        <label className="block text-sm">Choose image<input type="file" accept="image/png,image/jpeg,image/webp" className="mt-2 block w-full text-sm" onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; if (file) void upload(key, file); }} /></label>
        {assets[key] && <button type="button" className="min-h-11 text-sm text-red-700" onClick={() => { setAssets((old) => ({ ...old, [key]: null })); state.markDirty(); }}>Remove {key}</button>}
      </div>)}
      <p className="text-xs text-slate-500 sm:col-span-2">JPEG, PNG or WebP up to 20 MB. Images are compressed before upload to at most 700 KB. Save within 24 hours to keep them. Removing the logo displays school initials.</p>
    </fieldset>
    {busy && <p role="status">Preparing and uploading image…</p>}{uploadError && <p role="alert" className="text-red-700">{uploadError}</p>}
    <fieldset disabled={state.pending} className="grid gap-5 rounded-2xl border bg-white p-5 sm:grid-cols-2">
      {Object.entries(BRAND_FIELDS).map(([key, field]) => <label key={key} className={field.max > 160 && key !== "facebook" && key !== "youtube" ? "sm:col-span-2" : ""}>
        <span className="text-sm font-medium">{field.label}</span>
        <textarea name={key} defaultValue={branding[key as keyof typeof BRAND_FIELDS]} maxLength={field.max} rows={field.max > 500 ? 4 : 2} required={key === "headline"} aria-invalid={!!state.fieldErrors[key]} aria-describedby={state.fieldErrors[key] ? `${key}-error` : undefined} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold" />
        {state.fieldErrors[key] && <p id={`${key}-error`} className="text-sm text-red-700">{state.fieldErrors[key]}</p>}
      </label>)}
    </fieldset>
    <SaveBar {...state} pending={state.pending || busy} onCancel={() => { state.cancel(); setAssets({ logo: branding.logo, signature: branding.signature }); setUploadError(""); }} />
  </form>;
}
