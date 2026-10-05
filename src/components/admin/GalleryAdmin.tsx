"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createAlbum, deleteImage, assignGalleryBsYear, renameAlbum, deleteAlbum, movePhotos } from "@/app/admin/(panel)/gallery/actions";
import { FiUpload, FiTrash2, FiPlus, FiImage, FiCheckSquare, FiX } from "react-icons/fi";
import { compressPhoto } from "@/lib/compress-photo";
import { galleryThumbnail } from "@/lib/gallery-image-url";
import { uploadPhoto } from "@/lib/upload-photo";
import Modal from "@/components/Modal";
import type { GalleryYearFilter } from "@/lib/gallery-year";

export default function GalleryAdmin({ albums, activeId, images, page, totalPages, yearFilter, yearOptions, defaultUploadYear, hasUnspecified }: {
  albums: { id: string; title: string; count: number }[]; activeId: string;
  images: { id: string; url: string; eventBsYear: number | null }[]; page: number; totalPages: number;
  yearFilter: GalleryYearFilter; yearOptions: number[]; defaultUploadYear: number; hasUnspecified: boolean;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const [uploadYear, setUploadYear] = useState(defaultUploadYear);
  const [assignmentYear, setAssignmentYear] = useState<string>(String(defaultUploadYear));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assignmentStatus, setAssignmentStatus] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [albumDialog, setAlbumDialog] = useState<"options" | "rename" | "delete" | "move" | null>(null);
  const [albumTitle, setAlbumTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [albumStatus, setAlbumStatus] = useState("");
  const active = albums.find((a) => a.id === activeId);
  const href = (album: string, p = 1, year: GalleryYearFilter = yearFilter) => `/admin/gallery?album=${encodeURIComponent(album)}&year=${year}&page=${p}`;
  useEffect(() => { setSelectedIds([]); setSelectMode(false); setAssignmentStatus(""); setAlbumDialog(null); setError(""); }, [activeId, yearFilter, page]);

  async function onAlbumChange() {
    if (busy || !active || !albumDialog || albumDialog === "options") return;
    setBusy(true); setError(""); setAlbumStatus("");
    try {
      const result = albumDialog === "rename" ? await renameAlbum(activeId, albumTitle)
        : albumDialog === "delete" ? await deleteAlbum(activeId)
        : await movePhotos(activeId, destination, selectedIds);
      if (!result.ok) throw new Error(result.error);
      if (albumDialog === "delete") {
        setAlbumStatus(`Album "${active.title}" deleted.`);
        const next = albums.find((a) => a.id !== activeId);
        setUploadOpen(false);
        router.push(next ? href(next.id, 1, "all") : "/admin/gallery");
      } else if (albumDialog === "move") {
        setAlbumStatus(`${selectedIds.length} photos moved to ${albums.find((a) => a.id === destination)?.title}. BS years were preserved.`);
        setSelectedIds([]);
      } else setAlbumStatus("Album renamed.");
      setAlbumDialog(null); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update album."); }
    finally { setBusy(false); }
  }

  async function onUpload() {
    const files = Array.from(fileRef.current?.files ?? []);
    if (!files.length || !activeId || busy) return;
    setBusy(true); setError(""); setResults([]);
    let succeeded = 0;
    for (const [i, file] of files.entries()) {
      try {
        setProgress(`Compressing photo ${i + 1} of ${files.length}...`);
        const compressed = await compressPhoto(file);
        const fd = new FormData(); fd.set("albumId", activeId); fd.set("eventBsYear", String(uploadYear)); fd.append("files", compressed);
        setProgress(`Uploading photo ${i + 1} of ${files.length}...`);
        await uploadPhoto("/api/admin/gallery/upload", fd, (percent) => setProgress(`Uploading photo ${i + 1} of ${files.length}: ${percent}%${percent === 100 ? " - saving..." : ""}`));
        succeeded++;
        setResults((prev) => [...prev, `${file.name}: uploaded for ${uploadYear} BS (${Math.round(compressed.size / 1000)} KB)`]);
      } catch (e) {
        setResults((prev) => [...prev, `${file.name}: ${e instanceof Error ? e.message : "Upload failed"}`]);
      }
    }
    setProgress(`${succeeded} of ${files.length} photos uploaded.`);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }
  async function onDelete() {
    if (!removing) return;
    setBusy(true); setError("");
    try { const result = await deleteImage(removing); if (!result.ok) throw new Error(result.error); setRemoving(null); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not delete photo."); }
    finally { setBusy(false); }
  }
  async function onAssignYear() {
    if (!selectedIds.length || busy) return;
    setBusy(true); setError(""); setAssignmentStatus("");
    try {
      const year = assignmentYear === "unspecified" ? null : Number(assignmentYear);
      const result = await assignGalleryBsYear(activeId, selectedIds, year);
      if (!result.ok) throw new Error(result.error);
      setAssignmentStatus(`${result.count} photo${result.count === 1 ? "" : "s"} updated to ${year === null ? "Year unspecified" : `${year} BS`}.`);
      setSelectedIds([]);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update photo years.");
    } finally {
      setBusy(false);
    }
  }
  return <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">School moments</p><h1 className="font-heading text-3xl font-bold">Photo gallery</h1><p className="mt-2 text-sm text-slate-500">Organize photos by album and BS year.</p></div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setCreateOpen((value) => !value)} aria-expanded={createOpen} aria-controls="new-album-form" className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-slate-50"><FiPlus /> New album</button>
        <button type="button" onClick={() => setUploadOpen((value) => !value)} disabled={!activeId} aria-expanded={uploadOpen} aria-controls="gallery-upload-panel" className="flex min-h-11 items-center gap-2 rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-40"><FiUpload /> Upload photos</button>
      </div>
    </div>

    <section aria-label="Albums" className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3 px-1"><h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Albums</h2><span className="text-xs text-slate-500">{albums.length} total</span></div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {albums.map((album) => <Link key={album.id} href={href(album.id)} aria-current={album.id === activeId ? "page" : undefined} onClick={(event) => { if (busy) event.preventDefault(); }}
          className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${album.id === activeId ? "bg-navy font-semibold text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`}>
          <span>{album.title}</span><span className={`rounded-full px-2 py-0.5 text-xs ${album.id === activeId ? "bg-white/20" : "bg-white text-slate-500"}`}>{album.count}</span>
        </Link>)}
        {!albums.length && <p className="px-1 py-2 text-sm text-slate-500">No albums yet. Create one to add photos.</p>}
      </div>
      {createOpen && <form id="new-album-form" action={async (fd) => {
        setBusy(true); setError("");
        try { const result = await createAlbum(fd); if (!result.ok) throw new Error(result.error); setCreateOpen(false); router.push(href(result.id!, 1, "all")); router.refresh(); }
        catch (e) { setError(e instanceof Error ? e.message : "Could not create album."); }
        finally { setBusy(false); }
      }} className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <input aria-label="New album name" name="title" placeholder="Album name" required maxLength={80} disabled={busy} autoFocus className="min-h-11 min-w-48 flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm" />
        <button disabled={busy} className="min-h-11 rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-navy disabled:opacity-50">Create album</button>
      </form>}
    </section>

    {uploadOpen && <section id="gallery-upload-panel" className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="font-semibold">Upload to {active?.title}</h2><p className="mt-1 text-xs text-slate-500">JPEG, PNG or WebP up to 20 MB. Each photo is compressed to 700 KB or less.</p></div><button type="button" onClick={() => setUploadOpen(false)} disabled={busy} aria-label="Close upload panel" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40"><FiX /></button></div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium">Event year (BS)
          <select value={uploadYear} onChange={(event) => setUploadYear(Number(event.target.value))} disabled={busy || !activeId} className="mt-2 block min-h-11 min-w-40 rounded-xl border border-slate-300 bg-white px-4 py-2">
            {yearOptions.map((year) => <option key={year} value={year}>{year} BS</option>)}
          </select>
        </label>
        <input aria-label="Choose photos to upload" ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || !activeId} className="min-h-11 max-w-full text-sm" />
        <button type="button" onClick={onUpload} disabled={busy || !activeId} className="min-h-11 rounded-xl bg-gold px-5 py-2 text-sm font-semibold text-navy disabled:opacity-50">{busy ? "Working..." : "Start upload"}</button>
      </div>
      {progress && <p role="status" className="mt-4 text-sm font-medium">{progress}</p>}
      {results.length > 0 && <ul className="mt-3 max-h-40 space-y-1 overflow-auto text-xs text-slate-600">{results.map((result, i) => <li key={i}>{result}</li>)}</ul>}
    </section>}

    {error && !removing && !albumDialog && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {albumStatus && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{albumStatus}</p>}
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="font-heading text-xl font-bold">{active?.title || "Photos"}</h2><p className="mt-1 text-sm text-slate-500">{active?.count ?? 0} photos in this album</p></div>
        <div className="flex flex-wrap items-end gap-2">
          <button type="button" disabled={busy || !active} onClick={() => { setError(""); setAlbumDialog("options"); }} className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium disabled:opacity-40">Album options &middot;&middot;&middot;</button>
          <label className="text-xs font-semibold text-slate-600">Event year
            <select value={yearFilter} disabled={busy || !activeId} onChange={(event) => router.push(href(activeId, 1, event.target.value === "unspecified" ? "unspecified" : event.target.value === "all" ? "all" : Number(event.target.value)))}
              className="mt-1 block min-h-11 min-w-40 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-800">
              <option value="all">All BS years</option>
              {yearOptions.map((year) => <option key={year} value={year}>{year} BS</option>)}
              {hasUnspecified && <option value="unspecified">Year unspecified</option>}
            </select>
          </label>
          <button type="button" disabled={busy || !images.length} onClick={() => { setSelectMode((value) => !value); setSelectedIds([]); }} aria-pressed={selectMode}
            className={`flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-40 ${selectMode ? "border-navy bg-navy text-white" : "border-slate-300 bg-white text-navy hover:bg-slate-50"}`}><FiCheckSquare /> {selectMode ? "Done selecting" : "Select photos"}</button>
        </div>
      </div>
      {selectMode && <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <button type="button" disabled={busy || !selectedIds.length} onClick={() => { setDestination(albums.find((a) => a.id !== activeId)?.id ?? ""); setError(""); setAlbumDialog("move"); }} className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-40">Move selected ({selectedIds.length})</button>
        <button type="button" disabled={busy} onClick={() => setSelectedIds(selectedIds.length === images.length ? [] : images.map((image) => image.id))} className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium">
          {selectedIds.length === images.length ? "Clear selection" : "Select all on this page"}
        </button>
        <label className="text-xs font-semibold text-slate-600">Set year for {selectedIds.length} selected
          <select value={assignmentYear} onChange={(event) => setAssignmentYear(event.target.value)} disabled={busy || !selectedIds.length} className="mt-1 block min-h-11 min-w-40 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal disabled:opacity-50">
            {yearOptions.map((year) => <option key={year} value={year}>{year} BS</option>)}
            <option value="unspecified">Year unspecified</option>
          </select>
        </label>
        <button type="button" onClick={onAssignYear} disabled={busy || !selectedIds.length} className="min-h-11 rounded-xl bg-navy px-5 py-2 text-sm font-semibold text-white disabled:opacity-40">{busy ? "Updating..." : "Assign year"}</button>
      </div>}
      {assignmentStatus && <p role="status" className="text-sm text-emerald-700">{assignmentStatus}</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {images.map((image) => <div key={image.id} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100">
          <Image src={galleryThumbnail(image.url)} alt={active?.title || "School photo"} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw" className="object-cover" />
          <span className="absolute bottom-2 right-2 rounded-full bg-navy/85 px-2 py-1 text-xs text-white">{image.eventBsYear === null ? "Year unspecified" : `${image.eventBsYear} BS`}</span>
          {selectMode && <label className="absolute left-2 top-2 flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-white shadow">
            <input type="checkbox" checked={selectedIds.includes(image.id)} disabled={busy} onChange={(event) => setSelectedIds((prev) => event.target.checked ? [...prev, image.id] : prev.filter((id) => id !== image.id))}
              aria-label={`Select photo ${image.id}`} className="h-5 w-5 accent-gold" />
          </label>}
          <button type="button" disabled={busy} onClick={() => setRemoving(image.id)} aria-label="Delete photo" className="absolute right-2 top-2 rounded-lg bg-white/90 p-3 text-red-600 shadow hover:bg-red-50"><FiTrash2 /></button>
        </div>)}
      </div>
      {!images.length && <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center"><FiImage className="mx-auto mb-3 text-slate-400" size={30} /><p className="text-sm text-slate-500">{activeId ? "No photos for this year in this album." : "Create an album to get started."}</p></div>}
      {totalPages > 1 && <nav aria-label="Gallery pages" className="flex items-center justify-between text-sm">
        <Link href={href(activeId, Math.max(1, page - 1))} aria-disabled={page === 1 || busy} tabIndex={page === 1 || busy ? -1 : undefined} className={page === 1 || busy ? "pointer-events-none opacity-40" : "font-semibold"}>Previous</Link><span>Page {page} of {totalPages}</span><Link href={href(activeId, Math.min(totalPages, page + 1))} aria-disabled={page === totalPages || busy} tabIndex={page === totalPages || busy ? -1 : undefined} className={page === totalPages || busy ? "pointer-events-none opacity-40" : "font-semibold"}>Next</Link>
      </nav>}
    </section>
    {removing && <Modal title="Delete photo" onClose={() => { if (!busy) setRemoving(null); }}><h2 className="text-xl font-bold">Delete this photo?</h2><p className="my-4 text-sm text-slate-500">It will be removed from the website and Cloudinary. This cannot be undone.</p>{error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}<div className="flex justify-end gap-3"><button autoFocus disabled={busy} onClick={() => setRemoving(null)} className="rounded-xl border px-4 py-2">Cancel</button><button disabled={busy} onClick={onDelete} className="rounded-xl bg-red-600 px-4 py-2 text-white">{busy ? "Deleting..." : "Delete photo"}</button></div></Modal>}
    {albumDialog && active && <Modal title={albumDialog === "options" ? "Album options" : albumDialog === "rename" ? "Rename album" : albumDialog === "delete" ? "Delete album" : "Move photos"} onClose={() => { if (!busy) setAlbumDialog(null); }}>
      <h2 className="text-xl font-bold">{albumDialog === "options" ? active.title : albumDialog === "rename" ? "Rename album" : albumDialog === "delete" ? `Delete "${active.title}"?` : `Move ${selectedIds.length} selected photos`}</h2>
      {albumDialog === "options" ? <div className="mt-5 space-y-3">
        <button type="button" onClick={() => { setAlbumTitle(active.title); setAlbumDialog("rename"); }} className="block min-h-12 w-full rounded-xl border px-4 text-left">Rename album</button>
        <button type="button" onClick={() => setAlbumDialog("delete")} className="block min-h-12 w-full rounded-xl border px-4 text-left text-red-700">Delete album</button>
        <button type="button" onClick={() => setAlbumDialog(null)} className="min-h-11 rounded-xl border px-4">Close</button>
      </div> : <form onSubmit={(event) => { event.preventDefault(); void onAlbumChange(); }} className="mt-4 space-y-4">
        {albumDialog === "rename" && <label className="block text-sm font-medium">Album name<input autoFocus required maxLength={80} disabled={busy} value={albumTitle} onChange={(event) => setAlbumTitle(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base" /></label>}
        {albumDialog === "delete" && <p className="text-sm text-slate-600">{active.count ? `This album contains ${active.count} photos. Move all photos to another album before deleting it. The count includes all BS years.` : "This album contains no photos. Only the empty album will be removed."}</p>}
        {albumDialog === "move" && <><p className="text-sm text-slate-600">Move photos from {active.title}. Their BS years and existing image files will be preserved.</p>{albums.length > 1 ? <label className="block text-sm font-medium">Destination album<select required disabled={busy} value={destination} onChange={(event) => setDestination(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base">{albums.filter((a) => a.id !== activeId).map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}</select></label> : <p className="text-sm text-slate-600">Create another album first, then return to move these photos.</p>}</>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" disabled={busy} onClick={() => setAlbumDialog(null)} className="min-h-11 rounded-xl border px-4">Cancel</button>
          {albumDialog === "delete" && active.count > 0 ? <button type="button" onClick={() => { setAlbumDialog(null); setSelectMode(true); setSelectedIds([]); }} className="min-h-11 rounded-xl bg-navy px-4 text-white">Select photos to move</button> : <button type="submit" disabled={busy || (albumDialog === "move" && !destination)} className={`min-h-11 rounded-xl px-4 text-white disabled:opacity-40 ${albumDialog === "delete" ? "bg-red-600" : "bg-navy"}`}>{busy ? "Saving..." : albumDialog === "delete" ? "Delete empty album" : albumDialog === "rename" ? "Save name" : "Move photos"}</button>}
        </div>
      </form>}
    </Modal>}
  </div>;
}
