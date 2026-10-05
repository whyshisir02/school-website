"use client";

import { useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { signOut } from "next-auth/react";
import { logOutAllDevices } from "@/app/admin/(panel)/settings/security-actions";

/**
 * "Log out of all devices" — revokes every active session for the account
 * (this browser included) by bumping the server-side token version, then sends
 * the current device to the login screen. Use it if a session may have been
 * left open on a shared/lost device.
 */
export default function SignOutEverywhere() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  async function run() {
    setPending(true);
    setError("");
    const res = await logOutAllDevices();
    if (res.ok) {
      signOut({ callbackUrl: "/admin/login" });
      return;
    }
    setPending(false);
    setConfirming(false);
    setError(res.error ?? "Could not sign out other devices. Please try again.");
  }

  return (
    <div className="space-y-3 rounded-xl bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-heading text-base font-bold text-navy">Log out of all devices</h2>
        <p className="mt-1 text-sm text-slate-500">
          Ends every signed-in session for this account, on every device and browser —
          including this one. You&rsquo;ll need to sign in again. Use this if you think a
          session was left open somewhere or a device was lost.
        </p>
      </div>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <FiLogOut /> Log out everywhere
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Sign out of every device now?</span>
          <button
            type="button"
            onClick={run}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            <FiLogOut /> {pending ? "Signing out…" : "Yes, log out everywhere"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={pending}
            className="text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
