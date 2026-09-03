import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function NoticeTicker() {
  const notices = await prisma.notice.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { slug: true, title: true },
  });

  if (notices.length === 0) return null;

  return (
    <div className="group flex items-stretch overflow-hidden bg-gold text-white">
      <span className="flex shrink-0 items-center bg-gold-dark px-4 py-2 text-xs font-bold uppercase tracking-wide">
        Latest
      </span>
      <div className="relative flex-1 overflow-hidden py-2">
        <div className="marquee flex w-max gap-12 whitespace-nowrap pl-6 text-sm font-medium group-hover:[animation-play-state:paused]">
          {[...notices, ...notices].map((n, i) => (
            <Link key={i} href={`/notices/${n.slug}`} className="hover:underline">
              ● {n.title}
            </Link>
          ))}
        </div>
      </div>
      <Link href="/notices" className="hidden shrink-0 items-center px-4 text-xs font-semibold underline sm:flex">
        All Notices
      </Link>
    </div>
  );
}
