export function pageNumber(value: string | null | undefined): number {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? Math.min(number, 100_000) : 1;
}

export const GALLERY_PAGE_SIZE = 24;
