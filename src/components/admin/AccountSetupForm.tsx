"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { setAccountPassword } from "@/app/account/setup/actions";
export default function AccountSetupForm() {
  const [token, setToken] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    setToken(new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "");
    window.history.replaceState(null, "", window.location.pathname);
    setLoaded(true);
  }, []);
  return <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h1 className="text-2xl font-bold text-navy">{done ? "Password saved" : "Set your account password"}</h1>
    {done ? <><p className="my-5 text-slate-600">Your account is ready. Previous sessions have been signed out.</p><Link href="/admin/login" className="btn-primary">Go to sign in</Link></> : !loaded ? <p className="mt-5" role="status">Opening setup link...</p> : !token ? <p className="mt-5 text-slate-600">Open the complete setup link shared by the website owner. If it is no longer available, ask for a new link.</p> : <form action={async (fd) => {
      if (busy) return; setBusy(true); setError("");
      try { const result = await setAccountPassword(fd); if (!result.ok) throw new Error(result.error); setDone(true); setToken(""); }
      catch (e) { setError(e instanceof Error ? e.message : "Could not set password."); }
      finally { setBusy(false); }
    }} className="mt-5 space-y-4">
      <p className="text-sm text-slate-600">Choose a password with at least 10 characters. This link can be used once.</p>
      <input type="hidden" name="token" value={token} />
      <label className="block text-sm font-semibold">New password<input required minLength={10} maxLength={72} disabled={busy} autoComplete="new-password" type="password" name="password" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base font-normal" /></label>
      <label className="block text-sm font-semibold">Confirm password<input required minLength={10} maxLength={72} disabled={busy} autoComplete="new-password" type="password" name="confirmation" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base font-normal" /></label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="min-h-12 w-full rounded-xl bg-navy px-4 font-semibold text-white disabled:opacity-40">{busy ? "Saving..." : "Save password"}</button>
    </form>}
  </div>;
}
