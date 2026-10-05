import { unstable_cache } from "next/cache";
import { prisma } from "./db";

export const getRecentNoticeCount = unstable_cache(async () => {
  return prisma.notice.count({
    where: { isPublished: true, publishedAt: { gte: new Date(Date.now() - 7 * 86400_000) } },
  });
}, ["recent-notice-count"], { revalidate: 60 });
