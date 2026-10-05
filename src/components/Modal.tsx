"use client";
import { useEffect, useRef } from "react";

export default function Modal({ title, onClose, children, className = "" }: {
  title: string; onClose: () => void; children: React.ReactNode; className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return <dialog ref={ref} aria-label={title} onCancel={(e) => { e.preventDefault(); close.current(); }}
    onClick={(e) => { if (e.target === e.currentTarget) close.current(); }}
    className={`w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-white p-6 text-navy shadow-xl backdrop:bg-navy/80 ${className}`}>
    {children}
  </dialog>;
}
