import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";

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
  const [stats, { heroSlides, branding }] = await Promise.all([
    getVisibleStats(),
    getSiteSettings(),
  ]);
  return (
    <section className="relative isolate overflow-hidden bg-navy">
      {/* Full-bleed slideshow background (admin-editable at /admin/settings) */}
      <HeroSlideshow slides={heroSlides} background />


      {/* Content */}
      <div className="container-page pointer-events-none relative z-10 flex min-h-[75vh] items-center py-20 lg:min-h-[82vh] lg:items-start">
        <div className="pointer-events-auto max-w-2xl">
          {/* Evergreen badge — no seasonal "admissions open" claim.
              Admission details live on the Contact page (Get in Touch button). */}
          {branding.motto && <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/70 px-4 py-1.5 text-sm font-semibold text-gold-light ring-1 ring-gold/50 backdrop-blur-sm">
            <FaGraduationCap size={14} /> {branding.motto}
          </span>}
          <h1 className="hero-text mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            {branding.headline === "Nurturing Minds From Nursery to Class 10" ? <>Nurturing Minds From <span className="text-gold">Nursery</span> to <span className="text-gold">Class 10</span></> : branding.headline}
          </h1>
          <p className="hero-text mt-4 text-lg font-medium text-white">
            {branding.description}
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <Link href="/academics" className="btn-primary">
              Explore Academics <FiArrowRight />
            </Link>
            <Link href="/notices" className="btn-outline-light">
              View Notices
            </Link>
          </div>
          {/* Publish only school-verified statistics. */}
          {stats.length > 0 && <div className="hero-text mt-8 flex flex-wrap gap-x-8 gap-y-4">
            {stats.slice(0, 3).map((s) => (
              <div key={s.label}>
                <div className="font-heading text-2xl font-bold text-gold">{s.value}</div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-100">{s.label}</div>
              </div>
            ))}
          </div>}
        </div>
      </div>
    </section>
  );
}
