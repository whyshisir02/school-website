import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const count = await prisma.notice.count({
    where: { isPublished: true, publishedAt: { gte: sevenDaysAgo } },
  });
  return NextResponse.json({ count });
}
