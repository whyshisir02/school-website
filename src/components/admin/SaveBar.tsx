"use client";
import { FiSave } from "react-icons/fi";
export default function SaveBar({ pending, dirty, saved, error, onCancel, label = "Save changes" }: {
  pending: boolean; dirty: boolean; saved: boolean; error: string; onCancel: () => void; label?: string;
}) {
  return <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
    <div aria-live="polite" className="text-sm"><p className={error ? "text-red-600" : saved && !dirty ? "text-emerald-700" : "text-slate-500"}>{error || (pending ? "Saving your changes?" : dirty ? "You have unsaved changes" : saved ? "Changes saved" : "All changes saved")}</p></div>
    <div className="flex gap-2"><button type="button" onClick={onCancel} disabled={pending || !dirty} className="rounded-xl border px-4 py-2.5 text-sm font-medium disabled:opacity-40">Cancel</button><button type="submit" disabled={pending || !dirty} className="flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-navy disabled:opacity-40"><FiSave />{pending ? "Saving?" : label}</button></div>
  </div>;
}
