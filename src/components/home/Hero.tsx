import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { STATS, SCHOOL, HERO_SLIDES } from "@/lib/school";
import HeroSlideshow from "./HeroSlideshow";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="container-page grid items-center gap-10 py-14 lg:h-[75vh] lg:grid-cols-[3fr_2fr] lg:py-0">
        {/* Left */}
        <div>
          {/* Evergreen badge — no seasonal "admissions open" claim.
              Admissions are handled via the Admission Inquiry button. */}
          <span className="inline-block rounded-full bg-gold/10 px-4 py-1.5 text-sm font-semibold text-gold-dark">
            🎓 {SCHOOL.motto}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
            Nurturing Minds From <span className="text-gold">Nursery</span> to{" "}
            <span className="text-gold">Class 10</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-600">
            Quality English-medium education with experienced teachers, modern facilities,
            and a caring environment in the heart of {SCHOOL.location}.
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <Link href="/academics" className="btn-primary">
              Explore Academics <FiArrowRight />
            </Link>
            <Link href="/notices" className="btn-outline">
              View Notices
            </Link>
          </div>
          <div className="mt-9 flex flex-wrap gap-8">
            {STATS.slice(0, 3).map((s) => (
              <div key={s.label}>
                <div className="font-heading text-2xl font-bold text-navy">{s.value}</div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — crossfading slideshow (also shown on mobile) */}
        <div className="relative h-[300px] sm:h-[380px] lg:h-full lg:min-h-[420px]">
          <HeroSlideshow slides={HERO_SLIDES} />
          <div className="absolute bottom-16 right-6 z-10 rounded-xl bg-navy px-5 py-4 text-white shadow-xl">
            <div className="font-heading text-2xl font-bold text-gold">N–10</div>
            <div className="text-xs">Nursery to Class 10</div>
          </div>
        </div>
      </div>
    </section>
  );
}
