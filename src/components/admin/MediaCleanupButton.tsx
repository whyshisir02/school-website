"use client";
import { useState } from "react";
import { cleanupMedia } from "@/app/admin/(panel)/gallery/actions";
export default function MediaCleanupButton() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return <section className="rounded-2xl border border-slate-200 bg-white p-6">
    <h2 className="font-semibold">Media storage</h2>
    <p className="mb-4 mt-2 text-sm text-slate-500">Remove unfinished uploads older than a day and retry pending deletions. Photos used on the site are protected.</p>
    <button disabled={busy} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium disabled:opacity-50" onClick={async () => {
      setBusy(true); setMessage("");
      try { const result = await cleanupMedia(); setMessage(result.ok ? `${result.deleted} unused files removed. ${result.remaining} queued; recent uploads wait 24 hours.${result.failed ? " Some deletions failed and will be retried." : ""}` : result.error!); }
      catch { setMessage("Cleanup could not complete. Please try again."); }
      finally { setBusy(false); }
    }}>{busy ? "Checking storage?" : "Clean up unused media"}</button>
    {message && <p role="status" className="mt-3 text-sm text-slate-600">{message}</p>}
  </section>;
}
