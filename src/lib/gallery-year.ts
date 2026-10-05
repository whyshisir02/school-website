import NepaliDate from "nepali-date-converter";

export type GalleryYearFilter = number | "all" | "unspecified";

export function currentBsYear(): number {
  return new NepaliDate(new Date()).getBS().year;
}

export function validBsYear(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 2000 && value <= currentBsYear() + 1;
}

export function parseGalleryYear(value: string | null | undefined): GalleryYearFilter {
  if (!value || value === "all") return "all";
  if (value === "unspecified") return "unspecified";
  if (!/^\d{4}$/.test(value)) return "all";
  const year = Number(value);
  return validBsYear(year) ? year : "all";
}

export function uploadYearChoices(): number[] {
  const current = currentBsYear();
  return Array.from({ length: 32 }, (_, index) => current + 1 - index);
}
