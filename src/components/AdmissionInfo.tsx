import Link from "next/link";
import { FaGraduationCap } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import { SCHOOL, currentAcademicYearBS } from "@/lib/school";

/**
 * The single source of truth for admission messaging, rendered on /contact
 * (full) and linked to from /academics (compact).
 *
 * Two things this deliberately does NOT say:
 *  - "Admission Open" / any seasonal claim. Admission here is a walk-in,
 *    once-a-year, in-person process at a village school front office; a live
 *    "open/closed" badge would be wrong most of the year and impossible for
 *    the school to maintain.
 *  - Any fee amount. Fee structure is out of scope for this site by request.
 *
 * What it does say is the part a parent actually needs: WHERE, WHEN, and WHAT
 * TO BRING — plus the one real deadline, which is that seats are limited per
 * class and the school will say so at the office.
 */
const REQUIREMENTS = [
  "Student's birth certificate",
  "Previous mark sheet (Class 2 and above)",
  "Passport-size photographs",
  "Transfer certificate (if changing schools)",
];

const STEPS = [
  { n: 1, text: "Visit the school office during working hours" },
  { n: 2, text: "Collect and fill in the admission form" },
  { n: 3, text: "Bring the student for a short, friendly interaction" },
];

export function AdmissionCompact() {
  const year = currentAcademicYearBS();
  return (
    <Link
      href="/contact#admission"
      className="group flex flex-col items-start gap-1 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-gold/50 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold-dark">
          <FaGraduationCap size={16} />
        </span>
        <span>
          <span className="block font-semibold text-navy">
            Admission for {year} (Nursery – Class 10)
          </span>
          <span className="block text-sm text-slate-500">
            Handled in person at the school office — no online form.
          </span>
        </span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-gold-dark group-hover:underline">
        See requirements <FiArrowRight size={14} />
      </span>
    </Link>
  );
}

export default function AdmissionInfo() {
  const year = currentAcademicYearBS();
  return (
    <div id="admission" className="scroll-mt-28 rounded-xl bg-navy p-6 text-white sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-1 text-sm font-semibold">
          <FaGraduationCap size={14} /> Admissions
        </span>
        <span className="text-sm text-slate-300">
          Academic year {year} · Nursery to Class 10
        </span>
      </div>

      <h2 className="mt-5 font-heading text-xl font-bold text-white sm:text-2xl">
        Admission is handled in person at the school
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-200">
        There is no online application form. Admission for the {year} academic year
        takes place at the school office in {SCHOOL.address.split(",")[0]} — send us a
        message below, call us, or simply visit us during working hours
        (Sun – Fri, 10 AM – 4 PM). Seats in each class are limited, so we recommend
        enquiring early.
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-light">
            What to bring
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            {REQUIREMENTS.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-light">
            How it works
          </h3>
          <ol className="mt-3 space-y-2 text-sm text-slate-200">
            {STEPS.map((s) => (
              <li key={s.n} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-gold-light">
                  {s.n}
                </span>
                {s.text}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={`tel:${SCHOOL.phone}`}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gold-dark"
        >
          Call {SCHOOL.phone}
        </a>
        <a
          href="#message-form"
          className="inline-flex items-center gap-2 rounded-full border-2 border-white/70 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-navy"
        >
          Send a message
        </a>
      </div>
    </div>
  );
}