"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { galleryThumbnail } from "@/lib/gallery-image-url";
import Modal from "@/components/Modal";
import type { GalleryYearFilter } from "@/lib/gallery-year";

type Photo = { id: string; url: string; caption: string | null; eventBsYear: number | null; album: { slug: string; title: string } };
type Page = { images: Photo[]; total: number; hasMore: boolean };
export default function GalleryGrid({ albums, initial, years, hasUnspecified }: {
  albums: { slug: string; title: string; count: number }[]; initial: Page;
  years: number[]; hasUnspecified: boolean;
}) {
  const [filter, setFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState<GalleryYearFilter>("all");
  const [data, setData] = useState(initial);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const request = useRef(0);
  const lastRequest = useRef<{ album: string; year: GalleryYearFilter; page: number }>({ album: "all", year: "all", page: 1 });
  async function load(album: string, year: GalleryYearFilter, nextPage: number) {
    const id = ++request.current;
    lastRequest.current = { album, year, page: nextPage };
    setBusy(true); setError("");
    try {
      const res = await fetch(`/api/gallery?album=${encodeURIComponent(album)}&year=${year}&page=${nextPage}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      if (request.current !== id) return;
      setData((prev) => ({ ...result, images: nextPage === 1 ? result.images : [...prev.images, ...result.images].filter((image, index, all) => all.findIndex((other) => other.id === image.id) === index) }));
      setFilter(album); setYearFilter(year); setPage(nextPage); setLightbox(null);
    } catch (e) {
      if (request.current === id) setError(e instanceof Error ? e.message : "Photos could not load. Please try again.");
    } finally { if (request.current === id) setBusy(false); }
  }
  const step = (dir: number) => setLightbox((i) => i === null ? null : (i + dir + data.images.length) % data.images.length);
  const photo = lightbox === null ? null : data.images[lightbox];
  return <>
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="font-heading text-lg font-bold text-navy">Browse photos</h2><p className="mt-1 text-xs text-slate-500">Choose an album and a BS year.</p></div>
        <label className="flex flex-col gap-1 text-xs font-semibold text-navy">Event year
          <select value={yearFilter} disabled={busy} onChange={(event) => void load(filter, event.target.value === "unspecified" ? "unspecified" : event.target.value === "all" ? "all" : Number(event.target.value), 1)}
            className="min-h-11 min-w-40 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-normal disabled:opacity-60">
            <option value="all">All BS years</option>
            {years.map((year) => <option key={year} value={year}>{year} BS</option>)}
            {hasUnspecified && <option value="unspecified">Year unspecified</option>}
          </select>
        </label>
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Filter photo albums">
        {[{ slug: "all", title: "All photos", count: null }, ...albums].map((album) => <button key={album.slug} disabled={busy}
          onClick={() => { if (album.slug !== filter) void load(album.slug, yearFilter, 1); }} aria-pressed={filter === album.slug}
          className={`min-h-11 shrink-0 rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-60 ${filter === album.slug ? "bg-navy text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
          {album.title}{yearFilter === "all" && album.count !== null && ` (${album.count})`}
        </button>)}
      </div>
    </div>
    <p className="mt-5 text-sm text-slate-500" role="status">{busy ? "Loading photos..." : `Showing ${data.images.length} of ${data.total} photos`}</p>
    {error && <p role="alert" className="mt-3 text-sm text-red-600">{error} <button className="underline" onClick={() => void load(lastRequest.current.album, lastRequest.current.year, lastRequest.current.page)}>Retry</button></p>}
    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.images.map((image, i) => <button key={image.id} onClick={() => setLightbox(i)} aria-label={`Open ${image.caption || image.album.title} photo`}
        className="group relative aspect-[16/9] overflow-hidden rounded-xl">
        <Image src={galleryThumbnail(image.url)} alt={image.caption || image.album.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" loading="lazy" className="object-cover transition duration-300 group-hover:scale-105" />
        <span className="absolute bottom-3 left-3 rounded-full bg-navy/85 px-3 py-1 text-xs font-semibold text-white">{image.eventBsYear === null ? "Year unspecified" : `${image.eventBsYear} BS`}</span>
      </button>)}
    </div>
    {!data.images.length && !busy && <p className="py-12 text-center text-slate-500">No photos in this album yet.</p>}
    {data.hasMore && <div className="mt-8 text-center"><button disabled={busy} onClick={() => void load(filter, yearFilter, page + 1)} className="btn-outline disabled:opacity-50">{busy ? "Loading..." : "Load more photos"}</button></div>}
    {photo && <Modal title={photo.caption || photo.album.title} onClose={() => setLightbox(null)} className="!max-w-5xl !bg-navy !p-4 !text-white">
      <div onKeyDown={(e) => { if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); } if (e.key === "ArrowRight") { e.preventDefault(); step(1); } }}>
        <div className="flex items-center justify-between gap-3"><p className="text-sm">{photo.caption || photo.album.title} · {photo.eventBsYear === null ? "Year unspecified" : `${photo.eventBsYear} BS`}</p><button autoFocus onClick={() => setLightbox(null)} aria-label="Close photo" className="rounded-lg p-3"><FiX size={22} /></button></div>
        <div className="relative h-[65vh]"><Image src={photo.url} alt={photo.caption || photo.album.title} fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-contain" /></div>
        <div className="mt-3 flex items-center justify-between"><button onClick={() => step(-1)} aria-label="Previous photo" className="rounded-lg p-3"><FiChevronLeft size={24} /></button><span className="text-sm">{lightbox! + 1} / {data.images.length}</span><button onClick={() => step(1)} aria-label="Next photo" className="rounded-lg p-3"><FiChevronRight size={24} /></button></div>
      </div>
    </Modal>}
  </>;
}
