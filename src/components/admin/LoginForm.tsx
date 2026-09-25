"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      redirect: false,
    });
    setLoading(false);
    if (res?.error === "locked") {
      setError("Too many failed attempts. Account locked for 15 minutes.");
    } else if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push(params.get("callbackUrl") ?? "/admin/dashboard");
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow-lg">
      <Image
        src="/images/logo.png"
        alt="School logo"
        width={64}
        height={64}
        className="mx-auto h-16 w-16 rounded-full object-contain"
      />
      <h1 className="text-center text-2xl font-bold">Admin Login</h1>
      <input name="email" type="email" required placeholder="Email"
        className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-gold" />
      <input name="password" type="password" required placeholder="Password"
        className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-gold" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
