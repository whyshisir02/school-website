"use client";

import { useRef, useState } from "react";
import { FiSend, FiCheckCircle } from "react-icons/fi";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  // Bot heuristic: real visitors take at least a couple seconds to fill this
  // in; scripted submissions tend to fire almost instantly after page load.
  const mountedAt = useRef(Date.now());

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const payload = {
      ...Object.fromEntries(form),
      elapsedMs: Date.now() - mountedAt.current,
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl bg-green-50 p-10 text-center">
        <FiCheckCircle size={48} className="text-green-600" />
        <h2 className="mt-4 text-xl font-bold">Message Sent!</h2>
        <p className="mt-2 text-slate-600">Thank you for reaching out. We will get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl bg-white p-8 shadow-sm">
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
        <input id="name" name="name" required
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-gold" />
      </div>
      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium">Phone *</label>
        <input id="phone" name="phone" type="tel" required
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-gold" />
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">Message *</label>
        <textarea id="message" name="message" rows={5} required
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-gold" />
      </div>
      {status === "error" && (
        <p className="text-sm text-red-600">Something went wrong. Please try again or call us.</p>
      )}
      <button type="submit" disabled={status === "loading"} className="btn-primary w-full justify-center disabled:opacity-60">
        <FiSend /> {status === "loading" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
