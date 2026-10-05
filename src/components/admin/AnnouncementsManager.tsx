"use client";
import { useState, useTransition } from "react";
import { compressPhoto } from "@/lib/compress-photo";
import { uploadPhoto } from "@/lib/upload-photo";
import { announcementStatus, validateAnnouncement, type Announcement, type AnnouncementIntent, type AnnouncementState } from "@/lib/announcement";
import { saveAnnouncement } from "@/app/admin/(panel)/announcements/actions";
import AnnouncementDialog from "@/components/AnnouncementDialog";
import Modal from "@/components/Modal";
import UnsavedChangesGuard from "./UnsavedChangesGuard";
import BSDatePicker from "./BSDatePicker";

const empty: Announcement = { title: "", description: "", url: "", publicId: "", link: "", startBS: "", endBS: "" };
const inputClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base focus:border-gold focus:outline-gold";
export default function AnnouncementsManager({ initial }: { initial: AnnouncementState }) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState<Announcement>(initial.draft || empty);
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [confirm, setConfirm] = useState<"hide" | "remove" | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(Boolean(initial.draft?.startBS || initial.draft?.endBS));
  const disabled = busy || pending;
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved.draft || empty);
  const status = announcementStatus(saved.live);
  function change<K extends keyof Announcement>(key: K, value: Announcement[K]) {
    setDraft((old) => ({ ...old, [key]: value })); setMessage(""); setError("");
  }
  async function upload(file: File) {
    setBusy(true); setError(""); setMessage(""); setProgress("Compressing image…");
    try {
      const photo = await compressPhoto(file);
      const form = new FormData(); form.append("file", photo);
      const result = await uploadPhoto("/api/admin/announcements/upload", form, (percent) => setProgress(percent === 100 ? "Finishing upload…" : `Uploading: ${percent}%`));
      if (!result.url || !result.publicId) throw new Error("The image upload response was incomplete.");
      setDraft((old) => ({ ...old, url: result.url!, publicId: result.publicId! }));
      setMessage(`Image ready (${Math.ceil(photo.size / 1000)} KB). Save a draft or publish to keep it.`);
    } catch (error) { setError(error instanceof Error ? error.message : "Upload failed. Please try again."); }
    finally { setBusy(false); setProgress(""); }
  }
  function save(intent: AnnouncementIntent) {
    if (disabled) return;
    setError(""); setMessage("");
    const content = { ...draft, description: draft.title, link: "" };
    if (intent === "draft" || intent === "publish") {
      try { validateAnnouncement(content); } catch (error) { setError((error as Error).message); return; }
    }
    startTransition(async () => {
      try {
        const result = await saveAnnouncement(saved.revision, intent, content);
        if (!result.state) { setError(result.error || "Could not save. Please try again."); return; }
        setSaved(result.state);
        // Hiding the published poster must not discard unsaved form edits.
        if (intent !== "hide") setDraft(result.state.draft || empty);
        setMessage(intent === "draft" ? "Draft saved. The published popup has not changed." : intent === "publish" ? `Announcement ${announcementStatus(result.state.live) === "Scheduled" ? "scheduled" : "published"}. Open the website in a new tab to see it when active.` : intent === "hide" ? "Popup hidden from new visits. Your saved draft is kept." : "Announcement removed.");
      } catch { setError("Could not save. Check your connection and account access, then try again."); }
    });
  }
  return <div className="mt-6 max-w-5xl space-y-4">
    <UnsavedChangesGuard dirty={dirty || busy} />
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${status === "Live" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}`}>{status}</span>
        <p className="text-sm text-slate-600">{saved.live ? `Published poster: ${saved.live.title}` : "No popup is currently published."}</p></div>
      {saved.live && <button type="button" disabled={disabled} onClick={() => setConfirm("hide")} className="min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-50">Hide popup</button>}
    </div>
    <form onSubmit={(e) => { e.preventDefault(); save("draft"); }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <fieldset disabled={disabled} className="min-w-0 p-4 sm:p-6">
        <div className="grid min-w-0 gap-6 md:grid-cols-2">
        <div className="min-w-0 space-y-3">
          <h2 className="text-lg font-bold">Announcement image</h2>
          <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
            {draft.url ? <img src={draft.url} alt={draft.title || "Announcement preview"} className="max-h-64 w-full object-contain" /> : <p className="max-w-xs text-center text-sm text-slate-500">Choose a greeting or notice poster.</p>}
          </div>
          <label className="block text-sm font-semibold">{draft.url ? "Replace image" : "Choose image"}<input type="file" accept="image/jpeg,image/png,image/webp" className="mt-3 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-3 file:text-white" onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; if (file) void upload(file); }} /></label>
          <p className="text-xs leading-relaxed text-slate-500">JPG, PNG or WebP. Up to 20 MB. Auto-compressed to 700 KB.</p>
          <button type="button" disabled={!draft.url} onClick={() => setPreview(true)} className="min-h-11 w-full rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-40">Preview popup</button>
        </div>
        <div className="min-w-0 space-y-5">
          <label className="block text-sm font-medium">Title<input value={draft.title} onChange={(e) => change("title", e.target.value)} maxLength={120} className={inputClass} placeholder="Dashain greetings" /></label>
          <details open={scheduleOpen} onToggle={(e) => setScheduleOpen(e.currentTarget.open)} className="rounded-xl border border-slate-200">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Schedule <span className="font-normal text-slate-500">(optional)</span></summary>
            <div className="space-y-4 border-t px-4 py-4">
              <p className="text-xs text-slate-500">Choose BS dates. Times are in Nepal time.</p>
              {(["startBS", "endBS"] as const).map((key) => {
                const [date = "", time = ""] = draft[key].split("T");
                return <div key={key} className="grid grid-cols-[minmax(0,1fr)_7rem] items-end gap-3">
                  <BSDatePicker label={key === "startBS" ? "Start date (BS)" : "End date (BS)"} value={date} disabled={disabled}
                    onChange={(date) => change(key, date ? `${date}T${time || (key === "startBS" ? "00:00" : "23:59")}` : "")} />
                  <label className="min-w-0 text-sm font-medium">Time<input type="time" disabled={!date || disabled} value={time} onChange={(e) => change(key, `${date}T${e.target.value}`)} className={`${inputClass} min-w-0 !px-2 !text-sm`} /></label>
                </div>;
              })}
              {(draft.startBS || draft.endBS) && <button type="button" onClick={() => { setDraft((old) => ({ ...old, startBS: "", endBS: "" })); setError(""); setMessage(""); }} className="min-h-11 text-xs underline">Clear schedule</button>}
              <p className="text-xs text-slate-500">No start date: show immediately. No end date: keep showing until hidden.</p>
            </div>
          </details>
          {!scheduleOpen && <p className="text-xs text-slate-500">{draft.startBS || draft.endBS ? "A schedule is set. Open to review dates." : "Publishes immediately and stays visible until hidden."}</p>}
        </div>
        </div>
      </fieldset>
      {progress && <p role="status" className="px-5 py-3 text-sm text-slate-600">{progress}</p>}
      {error && <p role="alert" className="mx-4 mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {message && <p role="status" className="mx-4 mb-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">{message}</p>}
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 bg-slate-50/60 p-4">
        <button type="button" disabled={disabled || !draft.url} onClick={() => save("publish")} className="min-h-12 flex-1 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 sm:flex-none">{pending ? "Saving…" : "Publish popup"}</button>
        <button type="submit" disabled={disabled || !draft.url} className="min-h-12 flex-1 rounded-xl border px-5 py-3 text-sm font-semibold disabled:opacity-50 sm:flex-none">Save draft</button>
        {dirty && <button type="button" disabled={disabled} onClick={() => { setDraft(saved.draft || empty); setError(""); setMessage(""); }} className="min-h-11 px-3 text-sm underline disabled:opacity-50">Discard edits</button>}
        {(saved.draft || saved.live) && <button type="button" disabled={disabled} onClick={() => setConfirm("remove")} className="min-h-11 px-3 text-sm text-red-700 underline disabled:opacity-50 sm:ml-auto">Remove announcement</button>}
      </div>
    </form>
    {preview && <AnnouncementDialog poster={{ ...draft, title: draft.title || "Announcement preview", description: draft.title || "Announcement image preview" }} preview onClose={() => setPreview(false)} />}
    {confirm && <Modal title={confirm === "hide" ? "Hide popup?" : "Remove announcement?"} onClose={() => setConfirm(null)}>
      <h2 className="text-xl font-bold">{confirm === "hide" ? "Hide this popup?" : "Remove this announcement?"}</h2>
      <p className="my-4 text-sm text-slate-600">{confirm === "hide" ? "New visitors will no longer see it. Your saved draft will remain available." : "The published popup and saved draft will be removed. Upload a new image to create another announcement."}</p>
      <div className="flex justify-end gap-3"><button type="button" autoFocus onClick={() => setConfirm(null)} className="min-h-11 rounded-xl border px-4">Cancel</button><button type="button" onClick={() => { save(confirm); setConfirm(null); }} className="min-h-11 rounded-xl bg-navy px-4 text-white">{confirm === "hide" ? "Hide popup" : "Remove"}</button></div>
    </Modal>}
  </div>;
}
