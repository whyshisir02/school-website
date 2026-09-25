"use client";

import { useState } from "react";
import { FiLock } from "react-icons/fi";
import { changePassword } from "@/app/admin/(panel)/settings/security-actions";

const inputCls =
  "w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-gold";

export default function ChangePasswordForm() {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async (fd) => {
        setPending(true);
        setError("");
        setSaved(false);
        const res = await changePassword(fd);
        setPending(false);
        if (res.ok) {
          setSaved(true);
          (document.getElementById("change-password-form") as HTMLFormElement | null)?.reset();
        } else {
          setError(res.error ?? "Could not change password. Please try again.");
        }
      }}
      id="change-password-form"
      className="space-y-4 rounded-xl bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="font-heading text-base font-bold text-navy">Change password</h2>
        <p className="mt-1 text-sm text-slate-500">
          Use at least 10 characters. You&rsquo;ll need your current password to confirm.
        </p>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-600">Current password</span>
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className={`mt-1 ${inputCls}`}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-600">New password</span>
          <input
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
            className={`mt-1 ${inputCls}`}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-600">Confirm new password</span>
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
            className={`mt-1 ${inputCls}`}
          />
        </label>
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn-primary !py-2.5 text-sm disabled:opacity-60">
          <FiLock /> {pending ? "Updating…" : "Update Password"}
        </button>
        {saved && <p className="text-sm font-medium text-green-600">Password updated.</p>}
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      </div>
    </form>
  );
}
