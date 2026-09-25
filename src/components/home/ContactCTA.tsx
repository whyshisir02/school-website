"use client";

import { useState } from "react";
import { FiSend, FiCheck } from "react-icons/fi";
import { SCHOOL } from "@/lib/school";

/**
 * Client component (holds the contact form state), so it can't read the DB
 * itself — the server home page passes current contact info in as props.
 * Falls back to school.ts defaults if rendered without them.
 */
export default function ContactCTA({
  address = SCHOOL.address,
  phone = SCHOOL.phone,
  email = SCHOOL.email,
  mapEmbed = SCHOOL.mapEmbed,
}: {
  address?: string;
  phone?: string;
  email?: string;
  mapEmbed?: string;
} = {}) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white py-16">
      <div className="container-page grid gap-10 lg:grid-cols-2">
        {/* Form */}
        <div>
          <h2 className="text-3xl font-bold">Get In Touch</h2>
          <p className="mt-2 text-slate-600">Have a question about admissions? Send us a message.</p>
          {sent ? (
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-green-50 p-5 text-green-700">
              <FiCheck size={20} /> Thank you! We will contact you soon.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <input
                name="name" required placeholder="Your Name"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-gold"
              />
              <input
                name="phone" required type="tel" placeholder="Phone Number"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-gold"
              />
              <textarea
                name="message" required rows={4} placeholder="Message"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-gold"
              />
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
                <FiSend /> {loading ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>

        {/* Map + info */}
        <div>
          <iframe
            src={mapEmbed}
            title="School map"
            className="h-[400px] w-full rounded-xl border-0 shadow-sm"
            loading="lazy"
          />
          <div className="mt-4 space-y-1 text-sm text-slate-700">
            <p><strong>Address:</strong> {address}</p>
            <p><strong>Phone:</strong> {phone}</p>
            <p><strong>Email:</strong> {email}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
