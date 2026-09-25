import type { Metadata } from "next";
import { FiMapPin, FiPhone, FiMail, FiClock } from "react-icons/fi";
import PageHeader from "@/components/PageHeader";
import AdmissionInfo from "@/components/AdmissionInfo";
import ContactForm from "@/components/contact/ContactForm";
import { SCHOOL } from "@/lib/school";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact & Admission Info",
  description: `Contact ${SCHOOL.name} — address, phone, email, location map, and how in-person admission from Nursery to Class 10 works.`,
};

export default async function ContactPage() {
  const s = await getSiteSettings();
  return (
    <>
      <PageHeader title="Contact & Admission" breadcrumb="Contact" />

      {/* Admission info — single source of truth for all admission messaging
          across the site (see AdmissionInfo.tsx for what it deliberately
          omits and why). */}
      <section className="container-page pt-10">
        <AdmissionInfo />
      </section>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-2">
        <div id="message-form" className="scroll-mt-28">
          <ContactForm />
        </div>
        <div>
          <iframe
            src={s.mapEmbed}
            title="School map"
            className="h-[400px] w-full rounded-xl border-0 shadow-sm"
            loading="lazy"
          />
          <a
            href={s.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full bg-gold/10 px-4 py-2 text-sm font-semibold text-gold-dark hover:bg-gold/20"
          >
            Open in Google Maps →
          </a>
          <div className="mt-6 space-y-2 text-slate-700">
            <p className="flex items-center gap-2"><FiMapPin className="shrink-0 text-gold-dark" /> <strong>Address:</strong> {s.address}</p>
            <p className="flex items-center gap-2"><FiPhone className="shrink-0 text-gold-dark" /> <strong>Phone:</strong> <a href={`tel:${s.phone}`} className="text-gold-dark hover:underline">{s.phone}</a></p>
            <p className="flex items-center gap-2"><FiMail className="shrink-0 text-gold-dark" /> <strong>Email:</strong> <a href={`mailto:${s.email}`} className="text-gold-dark hover:underline">{s.email}</a></p>
            <p className="flex items-center gap-2"><FiClock className="shrink-0 text-gold-dark" /> <strong>Hours:</strong> Sun – Fri, 10 AM – 4 PM</p>
          </div>
        </div>
      </div>
    </>
  );
}
