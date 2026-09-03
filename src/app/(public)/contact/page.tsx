import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/contact/ContactForm";
import { SCHOOL } from "@/lib/school";

export const metadata: Metadata = {
  title: "Contact & Admission Inquiry",
  description: `Contact ${SCHOOL.name} — address, phone, email, location map and admission inquiry details.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact & Admission Inquiry" breadcrumb="Contact" />

      {/* Admission info strip — placeholder details, confirm with school */}
      <section className="container-page pt-10">
        <div className="rounded-xl bg-navy p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-gold px-4 py-1 text-sm font-semibold">
              🎓 Admissions Open — 2082
            </span>
            <span className="text-sm text-slate-300">Nursery to Class 10</span>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-200">
            {/* ⚠️ Placeholder admission details — replace with actual requirements from the school */}
            To inquire about admission, send us a message below, call us, or visit the
            school front office during working hours (Sun – Fri, 10 AM – 4 PM). Please bring
            the student&apos;s birth certificate, previous mark sheet (if applicable), and
            passport-size photos.
          </p>
        </div>
      </section>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-2">
        <ContactForm />
        <div>
          <iframe
            src={SCHOOL.mapEmbed}
            title="School map"
            className="h-[400px] w-full rounded-xl border-0 shadow-sm"
            loading="lazy"
          />
          <a
            href={SCHOOL.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full bg-gold/10 px-4 py-2 text-sm font-semibold text-gold-dark hover:bg-gold/20"
          >
            Open in Google Maps →
          </a>
          <div className="mt-6 space-y-2 text-slate-700">
            <p><strong>📍 Address:</strong> {SCHOOL.address}</p>
            <p><strong>📞 Phone:</strong> <a href={`tel:${SCHOOL.phone}`} className="text-gold-dark hover:underline">{SCHOOL.phone}</a></p>
            <p><strong>✉️ Email:</strong> <a href={`mailto:${SCHOOL.email}`} className="text-gold-dark hover:underline">{SCHOOL.email}</a></p>
            <p><strong>🕐 Hours:</strong> Sun – Fri, 10 AM – 4 PM</p>
          </div>
        </div>
      </div>
    </>
  );
}
