import NepaliDate from "nepali-date-converter";

export type Announcement = {
  title: string; description: string; url: string; publicId: string; link: string;
  startBS: string; endBS: string;
};
export type AnnouncementState = { revision: string; draft: Announcement | null; live: Announcement | null };
export type AnnouncementIntent = "draft" | "publish" | "hide" | "remove";

/** BS wall-clock input is always interpreted in Nepal, regardless of server timezone. */
export function announcementTime(value: string): number | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error("Use a BS date in YYYY-MM-DD format and a time.");
  const [, y, m, d, h, min] = match.map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 32 || h > 23 || min > 59) throw new Error("Enter a valid BS date and time.");
  try {
    const date = new NepaliDate(y, m - 1, d);
    const bs = date.getBS();
    if (bs.year !== y || bs.month !== m - 1 || bs.date !== d) throw new Error();
    const ad = date.getAD();
    return Date.UTC(ad.year, ad.month, ad.date, h, min) - 345 * 60_000;
  } catch { throw new Error("This BS date is invalid or outside the supported calendar range."); }
}

export function validateAnnouncement(value: unknown): Announcement {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const text = (key: string) => typeof raw[key] === "string" ? raw[key].trim() : "";
  const data: Announcement = { title: text("title"), description: text("description"), url: text("url"), publicId: text("publicId"), link: text("link"), startBS: text("startBS"), endBS: text("endBS") };
  if (!data.title || data.title.length > 120) throw new Error("Enter an announcement title up to 120 characters.");
  if (!data.description) data.description = data.title;
  if (data.description.length > 1500) throw new Error("The image description must be at most 1,500 characters.");
  if (!data.url || data.url.length > 1000 || !data.publicId || data.publicId.length > 200) throw new Error("Upload an announcement image first.");
  // Keep image links on public school pages; disallow protocol-relative and encoded redirects.
  if (data.link && !/^\/(?:notices(?:\/[a-zA-Z0-9_-]+)?|academics|about|contact|gallery)?$/.test(data.link)) throw new Error("Choose a public school page, such as /notices or /contact.");
  const start = announcementTime(data.startBS), end = announcementTime(data.endBS);
  if (start !== null && end !== null && end <= start) throw new Error("The end must be after the start.");
  return data;
}

export function readAnnouncementState(value: unknown): AnnouncementState {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const read = (value: unknown) => { try { return value ? validateAnnouncement(value) : null; } catch { return null; } };
  return { revision: typeof raw.revision === "string" ? raw.revision : "", draft: read(raw.draft), live: read(raw.live) };
}
export function announcementStatus(live: Announcement | null, now = Date.now()): "Hidden" | "Scheduled" | "Expired" | "Live" {
  if (!live) return "Hidden";
  try {
    const start = announcementTime(live.startBS), end = announcementTime(live.endBS);
    if (end !== null && now >= end) return "Expired";
    if (start !== null && now < start) return "Scheduled";
    return "Live";
  } catch { return "Hidden"; }
}
