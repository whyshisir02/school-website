"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { HeroSlide } from "@/lib/school";

const AUTOPLAY_MS = 5000;

/**
 * Crossfading slideshow. Receives slides as props from the server
 * component (Hero.tsx) so the slide list stays in src/lib/school.ts —
 * add/remove lines there, this component adapts automatically.
 *
 * background=true renders edge-to-edge behind the hero content
 * (no rounding/shadow, dots bottom-right, mobile bottom gradient).
 */
export default function HeroSlideshow({
  slides,
  background = false,
}: {
  slides: HeroSlide[];
  background?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [prepared, setPrepared] = useState<Set<number>>(new Set([0]));
  const [loaded, setLoaded] = useState<Set<number>>(new Set());
  const [visibleIndex, setVisibleIndex] = useState(0);
  const count = slides.length;
  const currentReady = loaded.has(index);

  const select = useCallback((next: number) => { setPrepared((prev) => new Set([...prev, next])); setIndex(next); }, []);
  const go = useCallback((dir: 1 | -1) => select((index + dir + count) % count), [select, index, count]);
  useEffect(() => {
    const visibility = () => setHidden(document.hidden);
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, []);
  useEffect(() => { if (loaded.has(index)) setVisibleIndex(index); }, [index, loaded]);
  useEffect(() => {
    if (!currentReady || count <= 1 || hidden) return;
    const timer = setTimeout(() => setPrepared((prev) => new Set([...prev, (index + 1) % count])), 1200);
    return () => clearTimeout(timer);
  }, [index, currentReady, count, hidden]);

  useEffect(() => {
    if (count <= 1 || hidden || !currentReady) return;
    const t = setInterval(() => go(1), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [count, hidden, currentReady, go]);

  const touchX = useRef<number | null>(null);

  if (count === 0) return null;

  return (
    <div
      className={`overflow-hidden ${
        background ? "absolute inset-0" : "relative h-full w-full rounded-xl shadow-lg"
      }`}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(dx > 0 ? -1 : 1);
        touchX.current = null;
      }}
      aria-roledescription="carousel"
      aria-label="School photos"
    >
      {slides.map((slide, i) => prepared.has(i) && (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          loading="eager"
          onLoad={() => setLoaded((prev) => new Set([...prev, i]))}
          aria-hidden={i !== visibleIndex}
          sizes={background ? "100vw" : "(max-width: 1024px) 100vw, 40vw"}
          style={slide.objectPosition ? { objectPosition: slide.objectPosition } : undefined}
          className={`hero-slide object-cover transition-opacity duration-700 ${
            i === visibleIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {background && <div aria-hidden="true" className="hero-overlay pointer-events-none absolute inset-0" />}

      {/* Darken the controls over bright photos. */}
      {background && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy/70 to-transparent"
        />
      )}

      {count > 1 && <>
        <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-navy/60 text-white backdrop-blur transition hover:bg-navy"><FiChevronLeft size={20} /></button>
        <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-navy/60 text-white backdrop-blur transition hover:bg-navy"><FiChevronRight size={20} /></button>
        <div className="absolute inset-x-3 bottom-3 z-20 flex flex-wrap items-center justify-end gap-1 text-white sm:right-6">
          {slides.map((_, i) => <button key={i} type="button" onClick={() => select(i)} aria-label={`Go to photo ${i + 1}`} aria-current={i === visibleIndex} className="flex h-11 w-11 items-center justify-center rounded-full">
            <span aria-hidden="true" className={`h-2 rounded-full transition-all ${i === visibleIndex ? "w-6 bg-gold" : "w-2 bg-white/70"}`} />
          </button>)}
        </div>
      </>}
    </div>
  );
}
