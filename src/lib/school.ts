export const SCHOOL = {
  name: "Shree Eastern View English School",
  shortName: "Eastern View",
  tagline: "Nurturing Minds From Nursery to Class 10",
  motto: "Knowledge · Character · Excellence",
  established: 2065, // B.S. — from school letterpad
  address: "Belbari-10, Bhaunne, Morang, Nepal", // from school letterpad
  location: "Morang, Nepal",
  phone: "+977-9804399428", // primary — from letterpad
  phones: ["9762956732", "9804399428", "9842252002"], // from letterpad
  email: "easternviewenglishschool@gmail.com", // from letterpad
  regdNo: "53550/064/065", // COMP.REGD.NO from letterpad
  principalName: "J.B. Magar", // confirmed by school
  facebook: "https://www.facebook.com/easternviewschool", // official school page
  // Real Google Maps place — Shree Eastern View English School, Belbari-10, Bhaunne, Morang
  mapLink: "https://maps.app.goo.gl/EjGu4gE6geNpHT5r9",
  mapEmbed:
    "https://www.google.com/maps?q=26.6528334,87.4653822&hl=en&z=17&output=embed",
} as const;

// Current Nepali (Bikram Sambat) academic year, derived from today's date
// rather than hardcoded — a literal "2082" silently goes stale every Baisakh.
// Baisakh 1 falls around April 13–14, so an English year Y is BS (Y + 57) from
// mid-April onward and BS (Y + 56) before that.
export function currentAcademicYearBS(): number {
  const now = new Date();
  const baisakhStart = new Date(now.getFullYear(), 3, 14); // ~April 14
  return now.getFullYear() + (now >= baisakhStart ? 57 : 56);
}

// ⚠️ PLACEHOLDER VALUES — NOT VERIFIED BY THE SCHOOL.
// Replace with real figures once confirmed. Do not publish as-is.
export const STATS = [
  { value: "18+", label: "Years of Excellence" },
  { value: "1200+", label: "Students Enrolled" },
  { value: "35+", label: "Dedicated Teachers" },
  { value: "100%", label: "SEE Pass Rate" },
] as const;

// ─── Hero slideshow ──────────────────────────────────────────────────────────
// The homepage hero crossfades through these photos (3–4 recommended).
// To use real school photos: drop them into /public/images/hero/ and update
// the src paths below, e.g. "/images/hero/main.jpg". Add/remove lines freely —
// the slideshow adapts automatically. First slide should be the best shot of
// the school building (it's the LCP image).
export type HeroSlide = {
  src: string;
  alt: string;
  /** CSS object-position for the cover crop (e.g. "center 58%"). Lets a slide
   *  keep faces/subjects in view when the full-bleed hero crops it. */
  objectPosition?: string;
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    src: "/images/hero/hero-1.jpg",
    alt: "Students in traditional Nepali dress welcoming guests at Shree Eastern View English School",
  },
  {
    src: "/images/hero/hero-2.jpg",
    alt: "Young students in cultural attire during a school program",
    objectPosition: "center 42%",
  },
  {
    src: "/images/hero/hero-3.jpg",
    alt: "Students and staff gathered in front of the school building",
    objectPosition: "center 58%",
  },
];

// Chairman of the School Management Committee - confirm real name with school
// before launch. Used by the "Message from the Chairman" section on /about.
export const CHAIRMAN = {
  name: "", // TODO(school): real chairman name - empty hides the attribution line
  title: "Chairman, School Management Committee",
};
