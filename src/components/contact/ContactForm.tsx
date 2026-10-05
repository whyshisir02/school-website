"use client";

import { useState } from "react";
import { FiSend, FiCheckCircle } from "react-icons/fi";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    setError("");
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? "Could not send your message. Please try again or call us.");
      setStatus("sent");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" aria-live="polite" className="flex h-full flex-col items-center justify-center rounded-xl bg-green-50 p-10 text-center">
        <FiCheckCircle size={48} className="text-green-600" />
        <h2 className="mt-4 text-xl font-bold">Message Sent!</h2>
        <p className="mt-2 text-slate-600">Thank you for reaching out. We will get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl bg-white p-4 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold">Send us a Message</h2>
      {/* Honeypot — hidden from real visitors; bots that auto-fill every
          field trip this and get silently dropped server-side. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">Name *</label>
        <input id="name" name="name" required maxLength={100} autoComplete="name"
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-base outline-none sm:text-sm focus:border-gold" />
      </div>
      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium">Phone *</label>
        <input id="phone" name="phone" type="tel" required maxLength={20} autoComplete="tel"
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-base outline-none sm:text-sm focus:border-gold" />
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">Message *</label>
        <textarea id="message" name="message" rows={5} required maxLength={2000}
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-base outline-none sm:text-sm focus:border-gold" />
      </div>
      {status === "error" && (
        <p role="alert" className="text-sm text-red-600">{error}</p>
      )}
      <button type="submit" disabled={status === "loading"} className="btn-primary w-full justify-center disabled:opacity-60">
        <FiSend /> {status === "loading" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
