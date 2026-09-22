import Link from "next/link";
import { FiHome, FiSearch, FiArrowRight } from "react-icons/fi";

/**
 * Shared body for both 404 boundaries. Two files render this:
 *  - app/not-found.tsx         → unmatched URLs (no route matched, so the
 *                                public route-group layout is NOT applied —
 *                                that file supplies its own chrome)
 *  - app/(public)/not-found.tsx → notFound() thrown inside a public page
 *                                (e.g. a bad /notices/[slug]); the group
 *                                layout already supplies chrome
 * Keeping the copy in one place stops the two from drifting apart.
 */
const SUGGESTIONS = [
  { href: "/notices", label: "Notices", desc: "Exam schedules, holidays and announcements" },
  { href: "/academics", label: "Academics", desc: "Nursery to Class 10, subjects and facilities" },
  { href: "/gallery", label: "Gallery", desc: "Photos from school events and activities" },
  { href: "/contact", label: "Contact & Admission", desc: "Address, phone, map and admission info" },
];

export default function NotFoundBody() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy/5 text-navy">
        <FiSearch size={28} />
      </div>

      <p className="mt-6 font-heading text-5xl font-extrabold text-gold">404</p>
      <h1 className="mt-2 font-heading text-2xl font-bold text-navy sm:text-3xl">
        This page could not be found
      </h1>
      <p className="mt-4 max-w-md text-slate-600">
        The page may have been moved, or the link you followed could be out of date.
        Everything on the site is reachable from the links below.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          <FiHome size={16} /> Back to Home
        </Link>
        <Link href="/notices" className="btn-outline">
          Browse Notices
        </Link>
      </div>

      <div className="mt-14 w-full max-w-3xl border-t pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Popular pages
        </h2>
        <div className="mt-5 grid gap-3 text-left sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-gold/50 hover:shadow-sm"
            >
              <span>
                <span className="block font-semibold text-navy">{s.label}</span>
                <span className="mt-0.5 block text-sm text-slate-500">{s.desc}</span>
              </span>
              <FiArrowRight
                size={16}
                className="mt-1 shrink-0 text-slate-300 transition group-hover:text-gold-dark"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}