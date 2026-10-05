"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal";
import { loadPortrait, drawPortrait, croppedPortrait } from "@/lib/staff-photo";
import { uploadPhoto } from "@/lib/upload-photo";

export default function StaffPhotoPicker({ photoUrl, disabled, onChange, onBusy }: {
  photoUrl: string | null; disabled: boolean; onChange: (photoUrl: string | null, publicId: string | null) => void; onBusy: (busy: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [source, setSource] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [uploading, setUploading] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  useEffect(() => {
    if (source && canvas.current) {
      try { drawPortrait(canvas.current, source, zoom, x, y, 320); }
      catch (e) { setError(e instanceof Error ? e.message : "Could not preview photo."); }
    }
  }, [source, zoom, x, y]);
  async function choose(file: File) {
    onBusy(true); setReading(true); setError(""); setProgress("");
    try { setSource(await loadPortrait(file)); setZoom(1); setX(50); setY(50); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not open photo."); onBusy(false); }
    finally { setReading(false); }
  }
  function cancel() { if (uploading) return; setSource(null); setError(""); onBusy(false); }
  async function upload() {
    if (!source || uploading) return;
    setUploading(true); setError(""); setProgress("Preparing portrait...");
    try {
      const photo = await croppedPortrait(source, zoom, x, y);
      const fd = new FormData(); fd.append("file", photo);
      const result = await uploadPhoto("/api/admin/staff/upload", fd, (percent) => setProgress(`Uploading: ${percent}%`));
      if (!result.url || !result.publicId) throw new Error("The upload response was incomplete. Try again.");
      onChange(result.url, result.publicId);
      setSource(null); setProgress(`Portrait ready (${Math.round(photo.size / 1000)} KB). Save the profile to keep it.`);
      onBusy(false);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not upload photo."); }
    finally { setUploading(false); }
  }
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-4">
      {photoUrl && <Image src={photoUrl} alt="Selected staff portrait" width={80} height={80} className="h-20 w-20 rounded-xl object-cover" />}
      <button type="button" disabled={disabled || reading} onClick={() => input.current?.click()} className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">{reading ? "Opening photo..." : photoUrl ? "Replace photo" : "Choose photo"}</button>
      {photoUrl && <button type="button" disabled={disabled} onClick={() => onChange(null, null)} className="min-h-11 rounded-xl px-3 text-sm text-red-700 disabled:opacity-50">Remove photo</button>}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void choose(file); }} />
    </div>
    <p className="text-xs text-slate-500">Optional. JPEG, PNG or WebP up to 20 MB. Adjust the crop before uploading; a small square portrait is saved.</p>
    {!source && error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {!source && progress && <p role="status" className="text-sm text-slate-600">{progress}</p>}
    {source && <Modal title="Crop staff portrait" onClose={cancel}>
      <h2 className="text-xl font-bold">Crop portrait</h2><p className="mt-2 text-sm text-slate-500">Keep the face near the centre. The profile card uses a circular crop.</p>
      <canvas ref={canvas} aria-label="Portrait crop preview" className="mx-auto my-5 aspect-square w-full max-w-80 rounded-xl bg-slate-100" />
      <fieldset disabled={uploading} className="space-y-3">
        <label className="block text-sm">Zoom<input aria-label="Portrait zoom" type="range" min="1" max="3" step="0.05" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="mt-2 block h-8 w-full accent-gold" /></label>
        <label className="block text-sm">Horizontal position<input aria-label="Portrait horizontal position" type="range" min="0" max="100" value={x} onChange={(e) => setX(Number(e.target.value))} className="mt-2 block h-8 w-full accent-gold" /></label>
        <label className="block text-sm">Vertical position<input aria-label="Portrait vertical position" type="range" min="0" max="100" value={y} onChange={(e) => setY(Number(e.target.value))} className="mt-2 block h-8 w-full accent-gold" /></label>
      </fieldset>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {uploading && <p role="status" className="mt-3 text-sm">{progress}</p>}
      <div className="mt-5 flex justify-end gap-3"><button type="button" disabled={uploading} onClick={cancel} className="min-h-11 rounded-xl border px-4 py-2">Cancel</button><button type="button" disabled={uploading} onClick={() => void upload()} className="min-h-11 rounded-xl bg-navy px-4 py-2 font-semibold text-white disabled:opacity-50">{uploading ? "Uploading..." : "Use this crop"}</button></div>
    </Modal>}
  </div>;
}
