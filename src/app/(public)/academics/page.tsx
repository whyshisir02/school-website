import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import {
  FiBookOpen, FiMonitor, FiThermometer, FiGrid, FiTruck, FiCoffee,
} from "react-icons/fi";

export const metadata: Metadata = {
  title: "Academics",
  description: "Programs from Nursery to Class 10, facilities and school timing at Eastern View.",
};

const tabs = [
  {
    id: "nursery",
    label: "Nursery & KG",
    classes: "Nursery, LKG, UKG",
    subjects: "English, Nepali, Math, Rhymes, Drawing, Activity-based learning",
    timing: "10:00 AM – 2:00 PM",
    criteria: "Age 3+ for Nursery. Friendly interaction with parents & child.",
  },
  {
    id: "primary",
    label: "Primary (1–5)",
    classes: "Class 1 to Class 5",
    subjects: "English, Nepali, Math, Science, Social Studies, Health, Computer",
    timing: "10:00 AM – 4:00 PM",
    criteria: "Entrance assessment in English, Math & Nepali basics.",
  },
  {
    id: "secondary",
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

      {/* Programs */}
      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {tabs.map((t) => (
            <div key={t.id} id={t.id} className="rounded-xl border border-slate-100 bg-white p-7 shadow-sm">
              <h2 className="text-xl font-bold">{t.label}</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div><dt className="font-semibold text-navy">Classes</dt><dd className="text-slate-600">{t.classes}</dd></div>
                <div><dt className="font-semibold text-navy">Subjects</dt><dd className="text-slate-600">{t.subjects}</dd></div>
                <div><dt className="font-semibold text-navy">Timing</dt><dd className="text-slate-600">{t.timing}</dd></div>
                <div><dt className="font-semibold text-navy">Admission</dt><dd className="text-slate-600">{t.criteria}</dd></div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* Facilities */}
      <section id="facilities" className="bg-slate-50 py-16">
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
