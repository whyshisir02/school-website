import { prisma } from "@/lib/db";
import NoticesManager from "@/components/admin/NoticesManager";

export const dynamic = "force-dynamic";

const PER_PAGE = 15;

export default async function AdminNoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, Number(sp.page ?? 1));

  const where = q ? { title: { contains: q, mode: "insensitive" as const } } : {};

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: { id: true, title: true, category: true, isPublished: true, content: true },
    }),
    prisma.notice.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <NoticesManager
      notices={notices}
      q={q}
      page={page}
      totalPages={totalPages}
      total={total}
    />
  );
}
