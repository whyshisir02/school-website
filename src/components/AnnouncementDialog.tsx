"use client";
import Link from "next/link";
import { FiX } from "react-icons/fi";
import Modal from "./Modal";

export type PopupPoster = { title: string; description: string; url: string; link: string };
export default function AnnouncementDialog({ poster, onClose, preview = false }: { poster: PopupPoster; onClose: () => void; preview?: boolean }) {
  // The stored original is already compressed; no additional Cloudinary transformations.
  const image = <img src={poster.url} alt={poster.description} onError={onClose} className="mx-auto block max-h-[82dvh] w-auto max-w-full object-contain" />;
  return <Modal title={preview ? `Preview: ${poster.title}` : poster.title} onClose={onClose} className="!w-fit !max-w-[calc(100vw-2rem)] !overflow-visible !bg-transparent !p-0">
    <div className="relative overflow-hidden rounded-xl bg-white">
      {poster.link && !preview ? <Link href={poster.link} onClick={onClose} className="block focus-visible:outline focus-visible:outline-4 focus-visible:outline-gold">{image}</Link> : image}
      <button type="button" autoFocus onClick={onClose} aria-label="Close announcement" className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-navy text-white shadow-lg ring-2 ring-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-gold"><FiX size={24} /></button>
    </div>
  </Modal>;
}
