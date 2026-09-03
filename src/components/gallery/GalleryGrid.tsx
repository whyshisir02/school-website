"use client";

import Image from "next/image";
import { useState } from "react";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

type Album = { slug: string; title: string; images: { url: string; caption?: string | null }[] };

export default function GalleryGrid({ albums }: { albums: Album[] }) {
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState<{ albumIdx: number; imgIdx: number } | null>(null);

  const visible = filter === "all" ? albums : albums.filter((a) => a.slug === filter);
  const flat = visible.flatMap((a, ai) => a.images.map((img, ii) => ({ ...img, ai, ii })));

  const step = (dir: 1 | -1) => {
    if (!lightbox) return;
    const idx = flat.findIndex((f) => f.ai === lightbox.albumIdx && f.ii === lightbox.imgIdx);
    const next = (idx + dir + flat.length) % flat.length;
    setLightbox({ albumIdx: flat[next].ai, imgIdx: flat[next].ii });
  };

  return (
    <>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-5 py-2 text-sm font-semibold ${filter === "all" ? "bg-navy text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
        >
          All
        </button>
        {albums.map((a) => (
          <button
            key={a.slug}
            onClick={() => setFilter(a.slug)}
            className={`rounded-full px-5 py-2 text-sm font-semibold ${filter === a.slug ? "bg-navy text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
          >
            {a.title}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {flat.map((f, i) => (
          <button
            key={i}
            onClick={() => setLightbox({ albumIdx: f.ai, imgIdx: f.ii })}
            className="group relative aspect-[16/9] overflow-hidden rounded-xl"
          >
            <Image
              src={f.url}
              alt={f.caption ?? "Gallery image"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              className="object-cover transition duration-300 group-hover:scale-110"
            />
            {f.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-left text-xs text-white opacity-0 transition group-hover:opacity-100">
                {f.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={() => setLightbox(null)}>
          <button className="absolute right-5 top-5 text-white" aria-label="Close"><FiX size={28} /></button>
          <button
            className="absolute left-4 text-white/80 hover:text-white"
            onClick={(e) => { e.stopPropagation(); step(-1); }}
            aria-label="Previous"
          >
            <FiChevronLeft size={40} />
          </button>
          <div className="relative h-[80vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={flat.find((f) => f.ai === lightbox.albumIdx && f.ii === lightbox.imgIdx)!.url}
              alt="Gallery image"
              fill
              className="object-contain"
            />
          </div>
          <button
            className="absolute right-4 text-white/80 hover:text-white"
            onClick={(e) => { e.stopPropagation(); step(1); }}
            aria-label="Next"
          >
            <FiChevronRight size={40} />
          </button>
        </div>
      )}
    </>
  );
}
