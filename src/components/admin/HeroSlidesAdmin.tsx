"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FiImage, FiTrash2, FiArrowUp, FiArrowDown, FiSave, FiLoader,
} from "react-icons/fi";
import {
  saveHeroSlides,
  type HeroSlideInput,
} from "@/app/admin/(panel)/settings/content-actions";
import type { HeroSlideItem } from "@/lib/settings";

/**
 * Manages the homepage hero slideshow photos. Uploads go straight to Cloudinary
 * via /api/admin/hero/upload and are appended locally; nothing is persisted (or
 * removed from the CDN) until Save, which sends the whole ordered list to
 * saveHeroSlides. Removing all slides falls back to the school.ts defaults.
 */
export default function HeroSlidesAdmin({ slides: initial }: { slides: HeroSlideItem[] }) {
  const [slides, setSlides] = useState<HeroSlideInput[]>(
    initial.map((s) => ({
      url: s.src,
      alt: s.alt,
      publicId: s.publicId,
      objectPosition: s.objectPosition,
    }))
  );
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function dirty() {
    setSaved(false);
    setError("");
  }

  async function onAdd(file: File) {
    setUploading(true);
    dirty();
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/hero/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) throw new Error(data?.error ?? "Upload failed");
      setSlides((prev) => [...prev, { url: data.url, alt: "", publicId: data.publicId }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function move(i: number, dir: -1 | 1) {
    setSlides((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    dirty();
  }

  function remove(i: number) {
    setSlides((prev) => prev.filter((_, k) => k !== i));
    dirty();
  }

  function setAlt(i: number, alt: string) {
    setSlides((prev) => prev.map((s, k) => (k === i ? { ...s, alt } : s)));
    dirty();
  }

  async function onSave() {
    setPending(true);
    dirty();
    const res = await saveHeroSlides(slides);
    setPending(false);
    if (res.ok) setSaved(true);
    else setError(res.error ?? "Could not save. Please try again.");
  }

  return (
    <div className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-heading text-base font-bold text-navy">Hero photos</h2>
        <p className="mt-1 text-sm text-slate-500">
          The crossfading photos behind the homepage headline. Add a few bright,
          wide shots (JPEG/PNG/WebP, under 5&nbsp;MB). Keep the main subject toward
          the right of the frame — the left is covered by the headline. Remove all
          photos to fall back to the built-in defaults.
        </p>
      </div>

      {slides.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
          No photos yet — the homepage will use the built-in defaults until you add some.
        </p>
      ) : (
        <ul className="space-y-3">
          {slides.map((s, i) => (
            <li
              key={`${s.url}-${i}`}
              className="flex items-start gap-3 rounded-lg border border-slate-200 p-3"
            >
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-slate-100">
                <Image
                  src={s.url}
                  alt={s.alt || "Hero photo"}
                  fill
                  sizes="96px"
                  className="object-cover"
                  style={s.objectPosition ? { objectPosition: s.objectPosition } : undefined}
                />
              </div>

              <label className="min-w-0 flex-1">
                <span className="text-xs font-medium text-slate-500">
                  Description (for accessibility &amp; SEO)
                </span>
                <input
                  value={s.alt}
                  onChange={(e) => setAlt(i, e.target.value)}
                  maxLength={200}
                  placeholder="e.g. Students at morning assembly in front of the school"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                  title="Move up"
                  className="rounded p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                >
                  <FiArrowUp size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === slides.length - 1}
                  aria-label="Move down"
                  title="Move down"
                  className="rounded p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                >
                  <FiArrowDown size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="Remove photo"
                  title="Remove photo"
                  className="rounded p-2 text-red-500 hover:bg-red-50"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-gold">
          {uploading ? <FiLoader className="animate-spin" /> : <FiImage />}
          {uploading ? "Uploading…" : "Add photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onAdd(f);
              e.target.value = "";
            }}
          />
        </label>

        <button
          type="button"
          onClick={onSave}
          disabled={pending || uploading}
          className="btn-primary !py-2.5 text-sm disabled:opacity-60"
        >
          <FiSave /> {pending ? "Saving…" : "Save Photos"}
        </button>

        {saved && <p className="text-sm font-medium text-green-600">Photos saved.</p>}
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      </div>
    </div>
  );
}
