import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import { STATS, SCHOOL, HERO_SLIDES } from "@/lib/school";
import HeroSlideshow from "./HeroSlideshow";

/**
 * PHOTO COMPOSITION NOTE (for whoever adds real hero photos):
 * The gradient overlay (`.hero-overlay` in globals.css) covers the LEFT ~60%
 * of the hero on desktop — choose photos that keep faces / key action in the
 * RIGHT third of the frame. Photos that are too dark or busy also fight the
 * white text; bright, wide shots of the building / assembly work best.
 */
export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy">
      {/* Full-bleed slideshow background */}
      <HeroSlideshow slides={HERO_SLIDES} background />

      {/* Left-heavy navy gradient overlay — text side is darkest,
          photos stay visible on the right. Flips vertical on mobile
          where text spans the full width. */}
      <div aria-hidden="true" className="hero-overlay absolute inset-0 -z-10" />

      {/* Content */}
      <div className="container-page relative flex min-h-[75vh] items-center py-20">
        <div className="max-w-2xl">
          {/* Evergreen badge — no seasonal "admissions open" claim.
              Admissions are handled via the Admission Info button. */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-4 py-1.5 text-sm font-semibold text-gold-light ring-1 ring-gold/40">
            <FaGraduationCap size={14} /> {SCHOOL.motto}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            Nurturing Minds From <span className="text-gold">Nursery</span> to{" "}
            <span className="text-gold">Class 10</span>
          </h1>
          <p className="mt-4 text-lg text-slate-200">
            Quality English-medium education with experienced teachers, modern facilities,
            and a caring environment in the heart of {SCHOOL.location}.
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <Link href="/academics" className="btn-primary">
              Explore Academics <FiArrowRight />
            </Link>
            <Link href="/notices" className="btn-outline-light">
              View Notices
            </Link>
          </div>
          {/* Trust stats — inside the gradient zone so they never sit over
              bare photo. They repeat in the StatsBanner further down the
              page; that's intentional reinforcement, not duplication. */}
          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
            {STATS.slice(0, 3).map((s) => (
              <div key={s.label}>
                <div className="font-heading text-2xl font-bold text-gold">{s.value}</div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-300">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
