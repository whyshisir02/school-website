import NepaliDate from "nepali-date-converter";

// Latin transliterations of the Bikram Sambat month names, indexed 0–11
// (0 = Baisakh … 11 = Chaitra), matching NepaliDate.getBS().month.
const BS_MONTHS = [
  "Baisakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Aswin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
] as const;

/**
 * Format a Gregorian (AD) date as a Bikram Sambat (BS) date string, e.g.
 * "9 Aswin 2082". Returns "" if conversion fails (out-of-range dates), so
 * callers can fall back to the AD date without crashing a page render.
 */
export function toBSDateString(date: Date): string {
  try {
    const { year, month, date: day } = new NepaliDate(date).getBS();
    return `${day} ${BS_MONTHS[month]} ${year}`;
  } catch {
    return "";
  }
}
