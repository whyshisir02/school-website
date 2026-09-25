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
  principalName: "Rajeen Magar", // confirmed by school
  facebook: "https://www.facebook.com/easternviewschool", // official school page
  // Real Google Maps place — Shree Eastern View English School, Belbari-10, Bhaunne, Morang
  mapLink: "https://maps.app.goo.gl/EjGu4gE6geNpHT5r9",
  mapEmbed:
    "https://www.google.com/maps?q=26.6528334,87.4653822&hl=en&z=17&output=embed",
} as const;

// NOTE: a subset of the fields above — name, address, phone, email, mapLink,
// mapEmbed — is editable at /admin/settings and read at runtime via
// getSiteSettings() in src/lib/settings.ts, with the values here as the
// fallback. The rest (shortName, tagline, motto, established, phones, regdNo,
// principalName, facebook, location) stay static because they rarely change
// and/or are used by client components and build-time SEO metadata
// (layout.tsx, opengraph-image.tsx) that read SCHOOL directly. If the school's
// registered name ever changes, update `name` here too so those SEO strings
// follow.

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
// These are now the *fallback defaults*: the admin can enter real, verified
// figures (or hide a tile) at /admin/settings, which override these via
// getSiteSettings()/getVisibleStats() in src/lib/settings.ts. Until then the
// site still shows these, so don't treat them as confirmed.
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
// name/title/messageHtml are editable at /admin/settings (Leadership messages);
// the values here are the fallback defaults.
export const CHAIRMAN = {
  name: "", // TODO(school): real chairman name - empty hides the attribution line
  title: "Chairman, School Management Committee",
  messageHtml: `<p>Since our establishment in ${SCHOOL.established} B.S., we have believed that every child deserves quality education regardless of background. We thank our parents and community for their continued trust.</p>`,
};

// Principal's message. The homepage shows the short `excerpt`; the full
// `messageHtml` letter appears on /about#principal-message. Both are editable at
// /admin/settings (Leadership messages), with these as the fallback defaults.
// ⚠️ PLACEHOLDER LETTER — replace with the principal's actual message.
export const PRINCIPAL = {
  excerpt:
    "Education is not just about books — it is about building character, confidence, and curiosity. At Eastern View, every child is nurtured to become their best self.",
  messageHtml: `<p>Dear parents, students and well-wishers,</p>
<p>It is my privilege to welcome you to ${SCHOOL.name}. Education is not just about books — it is about building character, confidence and curiosity. At Eastern View, every child is nurtured to become their best self.</p>
<p>Since our establishment in ${SCHOOL.established} B.S., our teachers have worked to give children from Nursery to Class 10 a strong foundation in both English-medium academics and good values. We believe every child, whatever their background, deserves the chance to learn, grow and dream bigger.</p>
<p>We are grateful to the parents and the wider Belbari community for the trust they place in us, and we remain committed to earning it every day. I warmly invite you to visit our campus, meet our teachers and see the caring learning environment we have built together.</p>`,
};
