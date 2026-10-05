import NepaliDate from "nepali-date-converter";

export const BS_MONTH_NAMES = ["Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"];
// Calendar range supported by the installed nepali-date-converter data.
export const BS_FIRST_YEAR = 2000;
export const BS_LAST_YEAR = 2090;
export function bsMonthDays(year: number, month: number) {
  const first = new NepaliDate(year, month, 1);
  if (first.getYear() !== year || first.getMonth() !== month) throw new Error("Invalid BS month");
  let days = 0;
  for (let day = 1; day <= 32; day++) {
    try {
      const date = new NepaliDate(year, month, day);
      if (date.getYear() !== year || date.getMonth() !== month || date.getDate() !== day) break;
      days++;
    } catch { break; }
  }
  return { days, weekday: first.getDay() };
}
export function bsDateValue(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
export function todayBS() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kathmandu", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  return new NepaliDate(new Date(part("year"), part("month") - 1, part("day"))).getBS();
}
