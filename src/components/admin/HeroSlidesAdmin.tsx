"use client";
import { useState } from "react";
import Image from "next/image";
import { FiImage, FiTrash2, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { saveHeroSlides, type HeroSlideInput } from "@/app/admin/(panel)/settings/content-actions";
import type { HeroSlideItem } from "@/lib/settings";
import { compressPhoto } from "@/lib/compress-photo";
import { uploadPhoto } from "@/lib/upload-photo";
import SaveBar from "./SaveBar";
import UnsavedChangesGuard from "./UnsavedChangesGuard";
import MediaCleanupButton from "./MediaCleanupButton";

export default function HeroSlidesAdmin({ slides: initial }: { slides: HeroSlideItem[] }) {
  const defaults = initial.map((s) => ({ url: s.src, alt: s.alt, publicId: s.publicId, objectPosition: s.objectPosition }));
  const [baseline, setBaseline] = useState<HeroSlideInput[]>(defaults);
  const [slides, setSlides] = useState<HeroSlideInput[]>(defaults);
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const [preview, setPreview] = useState(0);
  const [mobile, setMobile] = useState(false);
  const dirty = JSON.stringify(slides) !== JSON.stringify(baseline);
  const busy = uploading || pending;
  function update(index: number, patch: Partial<HeroSlideInput>) { setSlides((prev) => prev.map((s, i) => i === index ? { ...s, ...patch } : s)); setSaved(false); }
  async function onAdd(file: File) {
    if (slides.length >= 8 || busy) return;
    setUploading(true); setError(""); setSaved(false);
    try {
      setProgress("Compressing photo?");
      const fd = new FormData(); fd.append("file", await compressPhoto(file));
      const data = await uploadPhoto("/api/admin/hero/upload", fd, (percent) => setProgress(`Uploading: ${percent}%${percent === 100 ? " ? saving?" : ""}`));
      if (!data.url || !data.publicId) throw new Error("Upload failed. Please try again.");
      setSlides((prev) => [...prev, { url: data.url!, alt: "", publicId: data.publicId! }]);
      setProgress("Photo added. Save changes to publish it.");
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); }
    finally { setUploading(false); }
  }
  async function onSave() {
    if (busy || !dirty) return;
    setPending(true); setError("");
    try { const result = await saveHeroSlides(slides); if (!result.ok) throw new Error(result.error); setBaseline(slides); setSaved(true); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not save. Please try again."); }
    finally { setPending(false); }
  }
  const selected = slides[Math.min(preview, Math.max(0, slides.length - 1))];
  return <div className="mt-6 space-y-6">
    <UnsavedChangesGuard dirty={dirty || uploading} />
    <form onSubmit={(e) => { e.preventDefault(); void onSave(); }} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-heading text-lg font-bold">Homepage photos</h2><p className="mt-1 text-sm text-slate-500">Choose up to eight photos. Save changes to publish your selection.</p></div>
          <label className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${busy || slides.length >= 8 ? "opacity-40" : "cursor-pointer hover:border-gold"}`}><FiImage /> {uploading ? "Adding?" : "Add photo"}<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={busy || slides.length >= 8} onChange={(e) => { const file = e.target.files?.[0]; if (file) void onAdd(file); e.target.value = ""; }} /></label>
        </div>
        <p className="mt-3 text-xs text-slate-500">JPEG/PNG/WebP up to 20 MB, automatically compressed to 700 KB or less. Unpublished uploads expire after 24 hours.</p>
        {progress && <p role="status" className="mt-3 text-sm">{progress}</p>}
        <fieldset disabled={busy} className="mt-5 space-y-4">
          {slides.map((slide, i) => <div key={slide.publicId || slide.url} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-start gap-4"><button type="button" onClick={() => setPreview(i)} aria-label={`Preview photo ${i + 1}`} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg"><Image src={slide.url} alt={slide.alt || "Homepage photo"} fill sizes="112px" className="object-cover" style={{ objectPosition: slide.objectPosition }} /></button>
              <div className="min-w-0 flex-1"><label className="block text-xs font-semibold text-slate-500">Photo description<input value={slide.alt} onChange={(e) => update(i, { alt: e.target.value })} maxLength={200} placeholder="Students at morning assembly" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-navy" /></label>
                <label className="mt-3 block text-xs font-semibold text-slate-500">Keep this part visible<select value={slide.objectPosition || "center center"} onChange={(e) => update(i, { objectPosition: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-navy"><option value="center center">Center</option><option value="left center">Left</option><option value="right center">Right</option><option value="center top">Top</option><option value="center 38%">Upper center</option></select></label>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between"><span className="text-xs text-slate-400">Photo {i + 1}</span><div className="flex gap-1">{[-1, 1].map((dir) => <button key={dir} type="button" aria-label={dir === -1 ? "Move photo up" : "Move photo down"} disabled={i + dir < 0 || i + dir >= slides.length} onClick={() => { const next = [...slides]; [next[i], next[i + dir]] = [next[i + dir], next[i]]; setSlides(next); }} className="rounded-lg p-3 hover:bg-slate-50 disabled:opacity-30">{dir === -1 ? <FiArrowUp /> : <FiArrowDown />}</button>)}<button type="button" onClick={() => setSlides((prev) => prev.filter((_, index) => index !== i))} aria-label="Remove photo" className="rounded-lg p-3 text-red-600 hover:bg-red-50"><FiTrash2 /></button></div></div>
          </div>)}
        </fieldset>
        {!slides.length && <p className="mt-5 text-sm text-slate-500">No photos selected. Saving will restore the built-in school photos.</p>}
      </section>
      {selected && <section className="rounded-2xl border border-slate-200 bg-white p-6"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Crop preview</h2><div className="flex gap-2">{[false, true].map((value) => <button key={String(value)} type="button" aria-pressed={mobile === value} onClick={() => setMobile(value)} className={`rounded-lg px-3 py-2 text-xs ${mobile === value ? "bg-navy text-white" : "bg-slate-50"}`}>{value ? "Mobile" : "Desktop"}</button>)}</div></div><div className={`relative mx-auto overflow-hidden rounded-xl ${mobile ? "aspect-[3/4] max-w-xs" : "aspect-[16/7]"}`}><Image src={selected.url} alt={selected.alt || "Homepage crop preview"} fill sizes={mobile ? "320px" : "(max-width: 1024px) 100vw, 900px"} className="object-cover" style={{ objectPosition: selected.objectPosition }} /></div><p className="mt-3 text-xs text-slate-500">Preview shows the photo crop. The public homepage adds the school headline and overlay.</p></section>}
      <SaveBar pending={busy} dirty={dirty} saved={saved} error={error} label="Save photos" onCancel={() => { setSlides(baseline); setError(""); setProgress(""); setSaved(false); }} />
    </form>
    <MediaCleanupButton />
  </div>;
}
