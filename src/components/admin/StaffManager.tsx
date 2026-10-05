"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiArrowUp, FiArrowDown, FiMove, FiEdit2 } from "react-icons/fi";
import { archiveStaff, deleteStaff, reorderStaff, saveStaff } from "@/app/admin/(panel)/staff/actions";
import { STAFF_GROUPS, STAFF_STATUSES, staffInitials, type StaffProfile, type StaffGroup } from "@/lib/staff-types";
import StaffEditor from "./StaffEditor";
import Modal from "@/components/Modal";

export default function StaffManager({ members, canEditMessages }: { members: StaffProfile[]; canEditMessages: boolean }) {
  const router = useRouter();
  const [rows, setRows] = useState(members);
  const [editing, setEditing] = useState<StaffProfile | null | undefined>();
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState<{ member: StaffProfile; action: "archive" | "delete" } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  useEffect(() => setRows(members), [members]);
  const canReorder = !query.trim() && statusFilter === "ALL";
  const sorted = [...rows].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  const visible = sorted.filter((m) => (groupFilter === "ALL" || m.group === groupFilter) && (statusFilter === "ALL" || m.status === statusFilter) && [m.name, m.position, m.subject].some((s) => s.toLowerCase().includes(query.trim().toLowerCase())));
  async function changeOrder(group: StaffGroup, ids: string[]) {
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await reorderStaff(group, ids);
      if (!result.ok) throw new Error(result.error);
      setRows((prev) => prev.map((m) => m.group === group ? { ...m, order: ids.indexOf(m.id) } : m));
      setMessage("Staff order updated."); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update order."); router.refresh(); }
    finally { setBusy(false); setDragId(null); }
  }
  function move(member: StaffProfile, direction: number) {
    const ids = sorted.filter((m) => m.group === member.group).map((m) => m.id);
    const from = ids.indexOf(member.id), to = from + direction;
    if (to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    void changeOrder(member.group, ids);
  }
  function drop(target: StaffProfile) {
    const source = rows.find((m) => m.id === dragId);
    if (!source || source.group !== target.group || source.id === target.id || !canReorder || busy) return;
    const ids = sorted.filter((m) => m.group === target.group).map((m) => m.id);
    ids.splice(ids.indexOf(source.id), 1); ids.splice(ids.indexOf(target.id), 0, source.id);
    void changeOrder(target.group, ids);
  }
  async function confirmAction() {
    if (!confirm || busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await (confirm.action === "archive" ? archiveStaff(confirm.member.id) : deleteStaff(confirm.member.id));
      if (!result.ok) throw new Error(result.error);
      setMessage(confirm.action === "archive" ? "Profile archived and removed from About." : "Profile permanently deleted.");
      setConfirm(null); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not update profile."); }
    finally { setBusy(false); }
  }
  async function restore(member: StaffProfile) {
    if (busy) return; setBusy(true); setError("");
    try {
      const result = await saveStaff({ ...member, status: "DRAFT", isPrincipal: false });
      if (!result.ok) throw new Error(result.error);
      setMessage("Restored as a draft. Review it before publishing."); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not restore profile."); }
    finally { setBusy(false); }
  }
  if (editing !== undefined) return <StaffEditor canEditMessages={canEditMessages} key={editing?.id ?? "new"} member={editing} principalName={rows.find((m) => m.isPrincipal)?.name}
    onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); setMessage("Staff profile saved."); router.refresh(); }} />;
  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold">Faculty & staff</h1><p className="mt-2 text-sm text-slate-500">Manage the people shown on the About page.</p></div><button type="button" disabled={busy} onClick={() => { setError(""); setEditing(null); }} className="flex min-h-12 items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"><FiPlus />Add member</button></div>
    <div className="flex flex-wrap gap-3 text-sm">{Object.entries(STAFF_STATUSES).map(([key, label]) => <span key={key} className="rounded-full border border-slate-200 bg-white px-4 py-2">{label}: <strong>{rows.filter((m) => m.status === key).length}</strong></span>)}</div>
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[2fr_1fr_1fr]">
      <label className="text-xs font-semibold text-slate-600">Search<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, position or subject" className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 text-base font-normal" /></label>
      <label className="text-xs font-semibold text-slate-600">Group<select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base font-normal"><option value="ALL">All groups</option>{Object.entries(STAFF_GROUPS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <label className="text-xs font-semibold text-slate-600">Status<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base font-normal"><option value="ALL">All statuses</option>{Object.entries(STAFF_STATUSES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    </div>
    <p className="text-xs text-slate-500">{canReorder ? "Use the arrows or drag the move handle to reorder within each group." : "Clear the search and select All statuses to reorder profiles."}</p>
    {error && !confirm && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p>}
    {(Object.entries(STAFF_GROUPS) as [StaffGroup, string][]).map(([group, label]) => {
      const groupRows = visible.filter((m) => m.group === group);
      const allGroupRows = sorted.filter((m) => m.group === group);
      if (!groupRows.length) return null;
      return <section key={group} className="space-y-3"><h2 className="text-lg font-bold">{label} <span className="text-sm font-normal text-slate-500">({groupRows.length})</span></h2><ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {groupRows.map((member) => <li key={member.id} onDragOver={(e) => { if (canReorder && rows.find((m) => m.id === dragId)?.group === member.group) e.preventDefault(); }} onDrop={(e) => { e.preventDefault(); drop(member); }} className={`flex flex-wrap items-center gap-3 p-4 ${dragId === member.id ? "bg-slate-50" : ""}`}>
          {member.photoUrl ? <Image src={member.photoUrl} alt="" width={56} height={56} className="h-14 w-14 rounded-full object-cover" /> : <div aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy font-semibold text-gold">{staffInitials(member.name)}</div>}
          <div className="min-w-0 flex-1"><h3 className="break-words text-sm font-semibold">{member.name}</h3><p className="mt-1 break-words text-xs text-slate-500">{member.position}{member.subject ? ` · ${member.subject}` : ""}</p><div className="mt-2 flex flex-wrap gap-2"><span className={`rounded-full px-2 py-1 text-xs ${member.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{STAFF_STATUSES[member.status]}</span>{member.isPrincipal && <span className="rounded-full bg-gold/15 px-2 py-1 text-xs text-navy">Principal profile</span>}</div></div>
          <div className="flex w-full flex-wrap items-center gap-1 border-t border-slate-100 pt-3 sm:w-auto sm:border-0 sm:pt-0">
            <button type="button" disabled={busy || !canReorder} draggable={!busy && canReorder} onDragStart={(e) => { e.dataTransfer.setData("text/plain", member.id); e.dataTransfer.effectAllowed = "move"; setDragId(member.id); }} onDragEnd={() => setDragId(null)} aria-label={`Drag to reorder ${member.name}; use adjacent arrows for keyboard ordering`} title="Drag to reorder" className="hidden min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-500 disabled:opacity-30 lg:flex"><FiMove /></button>
            <button type="button" disabled={busy || !canReorder || allGroupRows[0]?.id === member.id} onClick={() => move(member, -1)} aria-label={`Move ${member.name} up`} className="min-h-11 min-w-11 rounded-xl p-3 hover:bg-slate-50 disabled:opacity-30"><FiArrowUp /></button>
            <button type="button" disabled={busy || !canReorder || allGroupRows.at(-1)?.id === member.id} onClick={() => move(member, 1)} aria-label={`Move ${member.name} down`} className="min-h-11 min-w-11 rounded-xl p-3 hover:bg-slate-50 disabled:opacity-30"><FiArrowDown /></button>
            <button type="button" disabled={busy} onClick={() => { setEditing(member); setError(""); }} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold hover:bg-slate-50"><FiEdit2 />Edit</button>
            {member.status === "ARCHIVED" ? <><button type="button" disabled={busy} onClick={() => void restore(member)} className="min-h-11 rounded-xl px-3 text-sm font-semibold hover:bg-slate-50">Restore draft</button><button type="button" disabled={busy} onClick={() => { setError(""); setConfirm({ member, action: "delete" }); }} className="min-h-11 rounded-xl px-3 text-sm text-red-700 hover:bg-red-50">Delete</button></> :
              <button type="button" disabled={busy} onClick={() => { setError(""); setConfirm({ member, action: "archive" }); }} className="min-h-11 rounded-xl px-3 text-sm text-slate-600 hover:bg-slate-50">Archive</button>}
          </div>
        </li>)}
      </ul></section>;
    })}
    {!visible.length && <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">{rows.length ? "No profiles match these filters." : "Add the first staff member to get started."}</div>}
    {confirm && <Modal title={confirm.action === "archive" ? "Archive staff profile" : "Delete staff profile"} onClose={() => { if (!busy) setConfirm(null); }}><h2 className="text-xl font-bold">{confirm.action === "archive" ? "Archive" : "Permanently delete"} {confirm.member.name}?</h2><p className="my-4 text-sm leading-relaxed text-slate-500">{confirm.action === "archive" ? "The profile will be hidden from About and kept privately for future use." : "This removes the saved profile and queues its unused portrait for deletion. This cannot be undone."}</p>{error && <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>}<div className="flex flex-wrap justify-end gap-3"><button type="button" autoFocus disabled={busy} onClick={() => setConfirm(null)} className="min-h-11 rounded-xl border px-4">Cancel</button><button type="button" disabled={busy} onClick={() => void confirmAction()} className="min-h-11 rounded-xl bg-navy px-4 text-white disabled:opacity-40">{busy ? "Working..." : confirm.action === "archive" ? "Archive profile" : "Delete permanently"}</button></div></Modal>}
  </div>;
}
