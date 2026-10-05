"use client";
import Link from "next/link";
import { useState } from "react";
import { saveStaff } from "@/app/admin/(panel)/staff/actions";
import { STAFF_GROUPS, STAFF_STATUSES, type StaffInput, type StaffProfile, type StaffStatus } from "@/lib/staff-types";
import StaffPhotoPicker from "./StaffPhotoPicker";
import StaffCard from "@/components/staff/StaffCard";
import UnsavedChangesGuard from "./UnsavedChangesGuard";
import Modal from "@/components/Modal";

const empty: StaffInput = { id: "", name: "", position: "", group: "TEACHING", status: "DRAFT", subject: "", qualifications: "", bio: "", photoUrl: null, publicId: null, updatedAt: "", isPrincipal: false };
const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-normal text-slate-800";
export default function StaffEditor({ member, principalName, onClose, onSaved, canEditMessages }: { canEditMessages: boolean; member: StaffProfile | null; principalName?: string; onClose: () => void; onSaved: () => void }) {
  const baseline: StaffInput = member ? { ...member } : empty;
  const [draft, setDraft] = useState<StaffInput>(baseline);
  const [pending, setPending] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [discard, setDiscard] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  const busy = pending || photoBusy;
  function update(patch: Partial<StaffInput>) { setDraft((old) => ({ ...old, ...patch })); setError(""); }
  async function submit(status: StaffStatus) {
    if (busy) return;
    if (draft.isPrincipal && (status !== "PUBLISHED" || draft.group !== "LEADERSHIP")) { setError("Publish this profile in Leadership to use it as the principal."); return; }
    setPending(true); setError("");
    try {
      const result = await saveStaff({ ...draft, status });
      if (!result.ok) throw new Error(result.error);
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save profile."); }
    finally { setPending(false); }
  }
  return <div className="space-y-5">
    <UnsavedChangesGuard dirty={dirty || busy} />
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">{member ? "Edit staff profile" : "Add staff member"}</h1><p className="mt-1 text-sm text-slate-500">Only published profiles appear on About.</p></div><button type="button" disabled={busy} onClick={() => dirty ? setDiscard(true) : onClose()} className="min-h-11 rounded-xl border bg-white px-4 text-sm font-semibold disabled:opacity-40">Back to staff</button></div>
    <form onSubmit={(event) => { event.preventDefault(); const button = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null; void submit(button?.value === "PUBLISHED" ? "PUBLISHED" : "DRAFT"); }} className="space-y-5">
      <fieldset disabled={pending} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Full name *<input autoFocus required maxLength={120} value={draft.name} onChange={(e) => update({ name: e.target.value })} className={inputClass} /></label>
          <label className="text-sm font-semibold">Position *<input required maxLength={100} placeholder="e.g. Mathematics Teacher" value={draft.position} onChange={(e) => update({ position: e.target.value })} className={inputClass} /></label>
          <label className="text-sm font-semibold">Group<select value={draft.group} onChange={(e) => update({ group: e.target.value as StaffInput["group"], isPrincipal: e.target.value === "LEADERSHIP" && draft.isPrincipal })} className={inputClass}>{Object.entries(STAFF_GROUPS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <label className="text-sm font-semibold">Subject or department<input maxLength={120} placeholder="e.g. Mathematics, Primary Level" value={draft.subject} onChange={(e) => update({ subject: e.target.value })} className={inputClass} /></label>
        </div>
        <div><h2 className="mb-3 text-sm font-semibold">Portrait</h2><StaffPhotoPicker photoUrl={draft.photoUrl} disabled={busy} onBusy={setPhotoBusy} onChange={(photoUrl, publicId) => update({ photoUrl, publicId })} /></div>
        <label className="block text-sm font-semibold">Qualifications <span className="font-normal text-slate-500">(optional)</span><input maxLength={200} placeholder="e.g. B.Ed., M.Ed." value={draft.qualifications} onChange={(e) => update({ qualifications: e.target.value })} className={inputClass} /></label>
        <label className="block text-sm font-semibold">Short introduction <span className="font-normal text-slate-500">(optional)</span><textarea rows={4} maxLength={1200} value={draft.bio} onChange={(e) => update({ bio: e.target.value })} className={inputClass} /><span className="mt-1 block text-right text-xs font-normal text-slate-500">{draft.bio.length}/1200</span></label>
        {draft.group === "LEADERSHIP" && <div className="rounded-xl bg-slate-50 p-4"><label className="flex min-h-11 items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={draft.isPrincipal} onChange={(e) => update({ isPrincipal: e.target.checked })} className="h-5 w-5 accent-gold" />Use this profile as the principal</label><p className="mt-1 text-xs leading-relaxed text-slate-600">Publishing this selection uses this name and photo on Home and About.{principalName && !member?.isPrincipal ? ` The current principal is ${principalName}.` : ""} Clearing the selection hides the principal messages until another principal is assigned.</p>{canEditMessages && <Link href="/admin/settings/messages" className="mt-2 inline-block py-2 text-sm font-semibold text-gold-dark">Edit leadership messages</Link>}</div>}
      </fieldset>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <span className="mr-auto text-xs text-slate-500">{member ? STAFF_STATUSES[member.status] : "New profile"}{dirty ? " · Unsaved changes" : ""}</span>
        <button type="button" disabled={busy} onClick={() => setPreview(true)} className="min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-40">Preview</button>
        <button type="submit" value="DRAFT" disabled={busy || draft.isPrincipal} className="min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-40">{pending ? "Saving..." : "Save draft"}</button>
        <button type="submit" value="PUBLISHED" disabled={busy} className="min-h-11 rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">{pending ? "Saving..." : member?.status === "PUBLISHED" ? "Save & publish" : "Publish profile"}</button>
      </div>
    </form>
    {preview && <Modal title="Staff profile preview" onClose={() => setPreview(false)}><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">Profile preview</h2><button type="button" onClick={() => setPreview(false)} className="min-h-11 rounded-xl border px-3">Close</button></div><StaffCard member={draft} /></Modal>}
    {discard && <Modal title="Discard changes" onClose={() => setDiscard(false)}><h2 className="text-xl font-bold">Discard unsaved changes?</h2><p className="my-4 text-sm text-slate-500">Your saved profile will be kept.</p><div className="flex justify-end gap-3"><button type="button" autoFocus onClick={() => setDiscard(false)} className="min-h-11 rounded-xl border px-4">Keep editing</button><button type="button" onClick={onClose} className="min-h-11 rounded-xl bg-navy px-4 text-white">Discard</button></div></Modal>}
  </div>;
}
