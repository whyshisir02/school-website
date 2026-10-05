"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
export default function UnsavedChangesGuard({ dirty }: { dirty: boolean }) {
  const router = useRouter();
  const [destination, setDestination] = useState<string | null>(null);
  useEffect(() => {
    if (!dirty) return;
    const unload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    const click = (e: MouseEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const link = (e.target as Element).closest("a");
      if (!link?.href || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname + url.search === location.pathname + location.search) return;
      e.preventDefault(); e.stopPropagation(); setDestination(url.pathname + url.search + url.hash);
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", click, true); };
  }, [dirty]);
  return destination ? <Modal title="Unsaved changes" onClose={() => setDestination(null)}>
    <h2 className="text-xl font-bold">Leave without saving?</h2><p className="my-4 text-sm text-slate-500">Your edits have not been saved yet.</p>
    <div className="flex justify-end gap-3"><button type="button" autoFocus className="rounded-xl border px-4 py-2" onClick={() => setDestination(null)}>Keep editing</button><button type="button" className="rounded-xl bg-navy px-4 py-2 text-white" onClick={() => { const next = destination; setDestination(null); router.push(next); }}>Leave page</button></div>
  </Modal> : null;
}
