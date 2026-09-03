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
  facebook: "#", // TODO(you): real Facebook page URL
  // Real Google Maps place — Shree Eastern View English School, Belbari-10, Bhaunne, Morang
  mapLink: "https://maps.app.goo.gl/EjGu4gE6geNpHT5r9",
  mapEmbed:
    "https://www.google.com/maps?q=26.6528334,87.4653822&hl=en&z=17&output=embed",
} as const;

// ⚠️ PLACEHOLDER VALUES — NOT VERIFIED BY THE SCHOOL.
// Replace with real figures once confirmed. Do not publish as-is.
export const STATS = [
  { value: "25+", label: "Years of Excellence" },
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
};

export const HERO_SLIDES: HeroSlide[] = [
  { src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=75", alt: "School building" },
  { src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=75", alt: "Students in classroom" },
  { src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&q=75", alt: "School activity" },
];

// Chairman of the School Management Committee - confirm real name with school
// before launch. Used by the "Message from the Chairman" section on /about.
export const CHAIRMAN = {
  name: "", // TODO(school): real chairman name - empty hides the attribution line
  title: "Chairman, School Management Committee",
};
