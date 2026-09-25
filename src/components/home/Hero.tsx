import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import { SCHOOL } from "@/lib/school";
import { getSiteSettings, getVisibleStats } from "@/lib/settings";
import HeroSlideshow from "./HeroSlideshow";

/**
 * PHOTO COMPOSITION NOTE (for whoever adds real hero photos):
 * The gradient overlay (`.hero-overlay` in globals.css) covers the LEFT ~60%
 * of the hero on desktop — choose photos that keep faces / key action in the
 * RIGHT third of the frame. Photos that are too dark or busy also fight the
 * white text; bright, wide shots of the building / assembly work best.
 */
export default async function Hero() {
  const [stats, { heroSlides }] = await Promise.all([
    getVisibleStats(),
    getSiteSettings(),
  ]);
  return (
    <section className="relative isolate overflow-hidden bg-navy">
      {/* Full-bleed slideshow background (admin-editable at /admin/settings) */}
      <HeroSlideshow slides={heroSlides} background />

      {/* Left-heavy navy gradient overlay — text side is darkest,
          photos stay visible on the right. Flips vertical on mobile
          where text spans the full width. */}
      <div aria-hidden="true" className="hero-overlay absolute inset-0 -z-10" />

      {/* Content */}
      <div className="container-page relative flex min-h-[75vh] items-center py-20">
        <div className="max-w-2xl">
          {/* Evergreen badge — no seasonal "admissions open" claim.
              Admission details live on the Contact page (Get in Touch button). */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/70 px-4 py-1.5 text-sm font-semibold text-gold-light ring-1 ring-gold/50 backdrop-blur-sm">
            <FaGraduationCap size={14} /> {SCHOOL.motto}
          </span>
          <h1 className="hero-text mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            Nurturing Minds From <span className="text-gold">Nursery</span> to{" "}
            <span className="text-gold">Class 10</span>
          </h1>
          <p className="hero-text mt-4 text-lg font-medium text-white">
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
          <div className="hero-text mt-10 flex flex-wrap gap-x-10 gap-y-4">
            {stats.slice(0, 3).map((s) => (
              <div key={s.label}>
                <div className="font-heading text-2xl font-bold text-gold">{s.value}</div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-100">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
