import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { AdmissionCompact } from "@/components/AdmissionInfo";
import { SCHOOL } from "@/lib/school";
import {
  FiBookOpen, FiMonitor, FiThermometer, FiGrid, FiTruck, FiCoffee,
  FiSmile, FiAward, FiClipboard, FiClock, FiUsers,
} from "react-icons/fi";

export const metadata: Metadata = {
  title: "Academics",
  description: "Programs from Nursery to Class 10, facilities and school timing at Eastern View.",
};

const tabs = [
  {
    id: "nursery",
    icon: <FiSmile size={22} />,
    label: "Nursery & KG",
    classes: "Nursery, LKG, UKG",
    subjects: "English, Nepali, Math, Rhymes, Drawing, Activity-based learning",
    timing: "10:00 AM – 2:00 PM",
    criteria: "Age 3+ for Nursery. Friendly interaction with parents & child.",
  },
  {
    id: "primary",
    icon: <FiClipboard size={22} />,
    label: "Primary (1–5)",
    classes: "Class 1 to Class 5",
    subjects: "English, Nepali, Math, Science, Social Studies, Health, Computer",
    timing: "10:00 AM – 4:00 PM",
    criteria: "Entrance assessment in English, Math & Nepali basics.",
  },
  {
    id: "secondary",
    icon: <FiAward size={22} />,
    label: "Secondary (6–10)",
    classes: "Class 6 to Class 10 (SEE)",
    subjects: "English, Nepali, Math, Science, Social, Computer, Optional Math, Account",
    timing: "10:00 AM – 4:00 PM",
    criteria: "Entrance exam + previous marksheet. SEE preparation from Class 9.",
  },
];

const facilities = [
  { icon: <FiBookOpen size={24} />, name: "Library", desc: "5,000+ books & reference materials" },
  { icon: <FiThermometer size={24} />, name: "Science Lab", desc: "Physics, Chemistry & Biology labs" },
  { icon: <FiMonitor size={24} />, name: "Computer Lab", desc: "Modern computers with internet" },
  { icon: <FiGrid size={24} />, name: "Sports Ground", desc: "Football, volleyball, basketball" },
  { icon: <FiTruck size={24} />, name: "Transport", desc: "School bus on major routes" },
  { icon: <FiCoffee size={24} />, name: "Cafeteria", desc: "Clean & hygienic meals" },
];

export default function AcademicsPage() {
  return (
    <>
      <PageHeader title="Academics" breadcrumb="Academics" />

      {/* Intro */}
      <section className="bg-white pt-14">
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-2xl font-bold text-navy md:text-3xl">
              Learning That Fits Every Stage
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              {SCHOOL.shortName} teaches from Nursery through Class 10 (SEE) — a single,
              continuous path from a child&apos;s first day at school to their first
              national board exam. Our classes are small, our teachers know every
              student by name, and lessons are taught in English and Nepali so children
              build strong foundations in both.
            </p>
          </div>

          {/* Quick facts — no fees or seasonal claims; admission here is handled
              in person at the school office (see /contact). */}
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            {[
              { icon: <FiBookOpen size={18} />, label: "Nursery – Class 10" },
              { icon: <FiClock size={18} />, label: "Sun – Fri, 10 AM onwards" },
              { icon: <FiUsers size={18} />, label: "English & Nepali medium" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-navy"
              >
                <span className="text-gold-dark">{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="container-page py-14">
        <div className="grid gap-6 md:grid-cols-3">
          {tabs.map((t) => (
            <div
              key={t.id}
              id={t.id}
              className="scroll-mt-28 rounded-xl border border-slate-100 bg-white p-7 shadow-sm transition hover:border-gold/40 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold-dark">
                  {t.icon}
                </span>
                <h2 className="text-xl font-bold">{t.label}</h2>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                <div><dt className="font-semibold text-navy">Classes</dt><dd className="text-slate-600">{t.classes}</dd></div>
                <div><dt className="font-semibold text-navy">Subjects</dt><dd className="text-slate-600">{t.subjects}</dd></div>
                <div><dt className="font-semibold text-navy">Timing</dt><dd className="text-slate-600">{t.timing}</dd></div>
                <div><dt className="font-semibold text-navy">Admission</dt><dd className="text-slate-600">{t.criteria}</dd></div>
              </dl>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-3xl">
          <AdmissionCompact />
        </div>
      </section>

      {/* Facilities */}
      <section id="facilities" className="scroll-mt-28 bg-slate-50 py-16">
        <div className="container-page">
          <h2 className="text-center text-3xl font-bold">Our Facilities</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((f) => (
              <div key={f.name} className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold-dark">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{f.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
