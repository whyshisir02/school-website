import { NextResponse } from "next/server";
import { getGalleryPage } from "@/lib/gallery-data";
import { pageNumber } from "@/lib/pagination";
import { parseGalleryYear } from "@/lib/gallery-year";
export async function GET(req: Request) {
  const url = new URL(req.url);
  try {
    const data = await getGalleryPage(pageNumber(url.searchParams.get("page")), url.searchParams.get("album") || "all", parseGalleryYear(url.searchParams.get("year")));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Photos could not load. Please try again." }, { status: 503 });
  }
}
