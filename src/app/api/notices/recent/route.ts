import { NextResponse } from "next/server";
import { getRecentNoticeCount } from "@/lib/recent-notices";

export async function GET() {
  const count = await getRecentNoticeCount();
  return NextResponse.json({ count });
}
