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
  principalName: "J.B. Magar", // from letterpad signature
  facebook: "#",
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3569.77!2d88.09!3d26.54!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDMyJzI0LjAiTiA4OMKwMDUnMzYuMCJF!5e0!3m2!1sen!2snp!4v1700000000000",
} as const;

// ⚠️ PLACEHOLDER VALUES — NOT VERIFIED BY THE SCHOOL.
// Replace with real figures once confirmed. Do not publish as-is.
export const STATS = [
  { value: "25+", label: "Years of Excellence" },
  { value: "1200+", label: "Students Enrolled" },
  { value: "35+", label: "Dedicated Teachers" },
  { value: "100%", label: "SEE Pass Rate" },
] as const;

// ─── Site images ────────────────────────────────────────────────────────────
// ⚠️ PLACEHOLDER IMAGES — replace with real school photos when available.
// Two ways to swap:
//   1. Local files: put photos in /public/images (e.g. /public/images/hero-main.jpg)
//      and change the URL to "/images/hero-main.jpg".
//   2. Any external URL (Unsplash etc.) — next.config.ts already allows images.unsplash.com.
export const IMAGES = {
  // Homepage hero collage
  heroMain: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&q=75",
  heroSmall1: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&q=75",
  heroSmall2: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=500&q=75",
  // People
  principal: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=75",
  // About page faculty (photo IDs — full URL is built in the page)
  faculty: [
    { name: "Mr. Ram Prasad Sharma", role: "Principal", img: "photo-1560250097-0b93528c311a" },
    { name: "Mrs. Sita Gurung", role: "Vice Principal, English", img: "photo-1573496359142-b8d87734a5a2" },
    { name: "Mr. Bikash Rai", role: "Mathematics", img: "photo-1507003211169-0a1dd7228f2d" },
    { name: "Ms. Anita Limbu", role: "Science", img: "photo-1494790108377-be9c29b29330" },
  ],
} as const;
