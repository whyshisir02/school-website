"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus } from "react-icons/fi";
import { saveUser, changeUserStatus, generateSetupLink } from "@/app/admin/(panel)/users/actions";
import { ASSIGNABLE_PERMISSIONS, type ManagedUser, type UserInput } from "@/lib/user-management-types";
import { DEFAULT_ADMIN_PERMISSIONS } from "@/lib/permissions";
import Modal from "@/components/Modal";
type Setup = { token: string; expiresAt: string };
export default function UsersManager({ users }: { users: ManagedUser[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [editor, setEditor] = useState<UserInput | null>(null);
  const [confirm, setConfirm] = useState<ManagedUser | null>(null);
  const [setup, setSetup] = useState<(Setup & { email: string; url: string }) | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const visible = users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase().trim()) && (status === "ALL" || (status === "DISABLED" ? !user.isActive : status === "PENDING" ? user.isActive && !user.passwordReady : user.isActive && user.passwordReady)));
  function showSetup(value: Setup, email: string) {
    setCopied(false); setSetup({ ...value, email, url: `${window.location.origin}/account/setup#token=${value.token}` });
  }
  async function save() {
    if (!editor || busy) return; setBusy(true); setError(""); setMessage("");
    try {
      const result = await saveUser(editor); if (!result.ok) throw new Error(result.error);
      const email = editor.email.trim().toLowerCase(); setEditor(null);
      setMessage("Account saved. Permission changes take effect immediately.");
      if (result.setup) showSetup(result.setup, email);
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save account."); }
    finally { setBusy(false); }
  }
  async function makeLink(user: ManagedUser) {
    if (busy) return; setBusy(true); setError(""); setMessage("");
    try { const result = await generateSetupLink(user.id, user.tokenVersion); if (!result.ok) throw new Error(result.error); showSetup(result.setup, user.email); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not create setup link."); }
    finally { setBusy(false); }
  }
  async function setActive() {
    if (!confirm || busy) return; setBusy(true); setError(""); setMessage("");
    try { const result = await changeUserStatus(confirm.id, confirm.tokenVersion, !confirm.isActive); if (!result.ok) throw new Error(result.error); setMessage(confirm.isActive ? "Account disabled. Sessions and setup links were revoked." : "Account enabled. Generate a setup link if the password has not been set."); setConfirm(null); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not change account status."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold">User management</h1><p className="mt-2 text-sm text-slate-600">Create school admin accounts and choose what each person can manage.</p></div><button type="button" disabled={busy} onClick={() => { setError(""); setEditor({ id: "", name: "", email: "", permissions: [...DEFAULT_ADMIN_PERMISSIONS], tokenVersion: 0 }); }} className="flex min-h-12 items-center gap-2 rounded-xl bg-navy px-5 font-semibold text-white disabled:opacity-40"><FiPlus />Add school admin</button></div>
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[2fr_1fr]">
      <label className="text-sm font-semibold">Search<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name or login email" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base font-normal" /></label>
      <label className="text-sm font-semibold">Status<select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base font-normal"><option value="ALL">All accounts</option><option value="ACTIVE">Active</option><option value="PENDING">Awaiting password</option><option value="DISABLED">Disabled</option></select></label>
    </div>
    {error && !editor && !confirm && !setup && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p>}
    <ul className="space-y-3">{visible.map((user) => <li key={user.id} className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><h2 className="break-words font-bold">{user.name || user.email}</h2>{user.name && <p className="mt-1 break-all text-sm text-slate-500">{user.email}</p>}<div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-navy/10 px-3 py-1 text-navy">{user.role === "SUPER_ADMIN" ? "Super Admin" : "School Admin"}</span><span className={`rounded-full px-3 py-1 ${!user.isActive ? "bg-red-50 text-red-700" : user.passwordReady ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{!user.isActive ? "Disabled" : user.passwordReady ? "Active" : "Awaiting password"}</span></div></div>
        {user.role === "ADMIN" && <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => { setError(""); setEditor({ id: user.id, name: user.name, email: user.email, permissions: user.permissions.filter((p) => Object.hasOwn(ASSIGNABLE_PERMISSIONS, p)), tokenVersion: user.tokenVersion }); }} className="min-h-11 rounded-xl border px-3 text-sm font-semibold">Edit access</button><button type="button" disabled={busy || !user.isActive} onClick={() => void makeLink(user)} className="min-h-11 rounded-xl border px-3 text-sm font-semibold disabled:opacity-40">{user.passwordReady ? "Reset password link" : "New setup link"}</button><button type="button" disabled={busy} onClick={() => { setError(""); setConfirm(user); }} className={`min-h-11 rounded-xl border px-3 text-sm ${user.isActive ? "text-red-700" : "text-emerald-800"}`}>{user.isActive ? "Disable" : "Enable"}</button></div>}
      </div>
      <p className="mt-4 text-sm text-slate-600">{user.role === "SUPER_ADMIN" ? "Full access. Manage your password through Account security." : user.permissions.filter((p) => Object.hasOwn(ASSIGNABLE_PERMISSIONS, p)).map((p) => ASSIGNABLE_PERMISSIONS[p as keyof typeof ASSIGNABLE_PERMISSIONS]).join(" / ") || "No content permissions assigned. Account security remains available."}</p>
    </li>)}</ul>
    {!visible.length && <p className="rounded-2xl border border-dashed p-10 text-center text-slate-500">No accounts match these filters.</p>}
    {editor && <Modal title={editor.id ? "Edit account access" : "Add school admin"} onClose={() => { if (!busy) setEditor(null); }} className="max-h-[calc(100dvh-2rem)] overflow-y-auto"><h2 className="text-xl font-bold">{editor.id ? "Edit account access" : "Add school admin"}</h2><form onSubmit={(e) => { e.preventDefault(); void save(); }} className="mt-5 space-y-4">
      <fieldset disabled={busy} className="space-y-4"><label className="block text-sm font-semibold">Name (optional)<input maxLength={120} value={editor.name} onChange={(e) => setEditor({ ...editor, name: e.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base font-normal" /></label>
      <label className="block text-sm font-semibold">Login email<input autoFocus={!editor.id} required type="email" maxLength={254} readOnly={!!editor.id} value={editor.email} onChange={(e) => setEditor({ ...editor, email: e.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base font-normal read-only:bg-slate-50" /></label>
      <p className="text-xs text-slate-500">This identifies the login account. A working inbox is not required for the manual setup link.</p>
      <div><h3 className="mb-2 text-sm font-semibold">Allowed sections</h3>{Object.entries(ASSIGNABLE_PERMISSIONS).map(([key, label]) => <label key={key} className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={editor.permissions.includes(key)} onChange={(e) => setEditor({ ...editor, permissions: e.target.checked ? [...editor.permissions, key] : editor.permissions.filter((p) => p !== key) })} className="h-5 w-5 accent-gold" />{label}</label>)}</div>
      <p className="text-xs text-slate-500">School identity and user management are reserved for you. Saving an existing account signs it out and invalidates its setup links.</p></fieldset>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap justify-end gap-3"><button type="button" disabled={busy} onClick={() => setEditor(null)} className="min-h-11 rounded-xl border px-4">Cancel</button><button disabled={busy} className="min-h-11 rounded-xl bg-navy px-4 text-white disabled:opacity-40">{busy ? "Saving..." : editor.id ? "Save access" : "Create account"}</button></div>
    </form></Modal>}
    {confirm && <Modal title="Change account status" onClose={() => { if (!busy) setConfirm(null); }}><h2 className="text-xl font-bold">{confirm.isActive ? "Disable" : "Enable"} this account?</h2><p className="my-4 break-words text-sm text-slate-600">{confirm.email}</p><p className="mb-4 text-sm text-slate-600">{confirm.isActive ? "This person will lose dashboard access immediately. Existing sessions and password setup links will be revoked. Their published content will remain on the website." : "This person will regain their assigned access. If they have not set a password, generate a new setup link afterward."}</p>{error && <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>}<div className="flex justify-end gap-3"><button type="button" autoFocus disabled={busy} onClick={() => setConfirm(null)} className="min-h-11 rounded-xl border px-4">Cancel</button><button type="button" disabled={busy} onClick={() => void setActive()} className="min-h-11 rounded-xl bg-navy px-4 text-white">{busy ? "Saving..." : confirm.isActive ? "Disable account" : "Enable account"}</button></div></Modal>}
    {setup && <Modal title="Password setup link" onClose={() => setSetup(null)}><h2 className="text-xl font-bold">Share this setup link privately</h2><p className="mt-3 break-words text-sm text-slate-600">Account: {setup.email}</p><p className="mt-2 text-sm text-slate-600">Expires {new Date(setup.expiresAt).toLocaleString("en-GB", { timeZone: "Asia/Kathmandu" })} (Nepal time). It works once and replaces previous links. No email has been sent.</p><label className="mt-4 block text-sm font-semibold">Setup link<input readOnly value={setup.url} onFocus={(e) => e.target.select()} className="mt-2 min-h-12 w-full rounded-xl border px-3 text-sm font-normal" /></label>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}<div className="mt-5 flex flex-wrap justify-end gap-3"><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(setup.url); setCopied(true); } catch { setError("Select the link above and copy it manually."); } }} className="min-h-11 rounded-xl border px-4">{copied ? "Copied" : "Copy link"}</button><button type="button" onClick={() => { setSetup(null); setError(""); }} className="min-h-11 rounded-xl bg-navy px-4 text-white">Done</button></div></Modal>}
  </div>;
}
