"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { createAlbum, deleteImage } from "@/app/admin/(panel)/gallery/actions";
import { FiUpload, FiTrash2, FiPlus } from "react-icons/fi";

type Album = { id: string; title: string; images: { id: string; url: string }[] };

export default function GalleryAdmin({ albums }: { albums: Album[] }) {
  const [activeId, setActiveId] = useState(albums[0]?.id ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const active = albums.find((a) => a.id === activeId);

  async function onUpload() {
    const files = fileRef.current?.files;
    if (!files?.length || !activeId) return;
    setUploading(true);
    const fd = new FormData();
    fd.set("albumId", activeId);
    Array.from(files).forEach((f) => fd.append("files", f));
    const res = await fetch("/api/admin/gallery/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => null);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (!res.ok) {
      alert(data?.error ?? "Upload failed. Use JPEG/PNG/WebP under 5MB.");
      return;
    }
    if (data?.skipped) {
      alert(
        `${data.count} image(s) uploaded, ${data.skipped} skipped (too large or not JPEG/PNG/WebP).`
      );
    }
    location.reload();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Manage Gallery</h1>

      {/* Album selector + create */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {albums.map((a) => (
          <button
            key={a.id}
            onClick={() => setActiveId(a.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              a.id === activeId ? "bg-navy text-white" : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {a.title} ({a.images.length})
          </button>
        ))}
        <form action={createAlbum} className="flex items-center gap-2">
          <input name="title" placeholder="New album name" required
            className="rounded-full border border-slate-200 px-4 py-1.5 text-sm outline-none focus:border-gold" />
          <button className="rounded-full bg-gold p-2 text-white" aria-label="Create album">
            <FiPlus size={14} />
          </button>
        </form>
      </div>

      {/* Upload */}
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-white p-5 shadow-sm">
        <input ref={fileRef} type="file" accept="image/*" multiple
          className="text-sm" />
        <button onClick={onUpload} disabled={uploading || !activeId} className="btn-primary !px-5 !py-2 text-sm disabled:opacity-60">
          <FiUpload /> {uploading ? "Uploading…" : "Upload to " + (active?.title ?? "album")}
        </button>
        <span className="text-xs text-slate-400">Max 5MB per image · JPG/PNG/WebP</span>
      </div>

      {/* Images */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {active?.images.map((img) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl">
            <Image src={img.url} alt="Gallery image" fill sizes="25vw" className="object-cover" />
            <button
              onClick={() => {
                if (confirm("Delete this image?")) deleteImage(img.id).then(() => location.reload());
              }}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white opacity-0 transition group-hover:opacity-100"
              aria-label="Delete image"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        ))}
        {active?.images.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-slate-500">
            No images in this album yet.
          </p>
        )}
      </div>
    </div>
  );
}
