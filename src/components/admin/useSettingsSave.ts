"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
type Result = { ok: boolean; error?: string; fieldErrors?: Record<string, string> };
export function useSettingsSave(action: (data: FormData) => Promise<Result>) {
  const router = useRouter();
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resetKey, setResetKey] = useState(0);
  const changes = useRef(0);
  function markDirty() { changes.current++; setDirty(true); setSaved(false); setError(""); setFieldErrors({}); }
  function cancel() { changes.current++; setDirty(false); setSaved(false); setError(""); setFieldErrors({}); setResetKey((value) => value + 1); }
  async function save(data: FormData) {
    if (pending) return;
    const version = changes.current;
    setPending(true); setError(""); setFieldErrors({});
    try {
      const result = await action(data);
      if (!result.ok) { setError(result.error || "Please check the highlighted fields."); setFieldErrors(result.fieldErrors || {}); return; }
      if (changes.current === version) { setDirty(false); setSaved(true); }
      router.refresh();
    } catch { setError("Your changes could not be saved. Check your connection and try again."); }
    finally { setPending(false); }
  }
  return { dirty, saved, pending, error, fieldErrors, resetKey, markDirty, cancel, save };
}
