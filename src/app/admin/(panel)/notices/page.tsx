import { requirePageAccess } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import NoticesManager from "@/components/admin/NoticesManager";
import { pageNumber } from "@/lib/pagination";

export const dynamic = "force-dynamic";

const PER_PAGE = 15;

export default async function AdminNoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; edit?: string; new?: string; view?: string }>;
}) {
  await requirePageAccess("NOTICES");
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = pageNumber(sp.page);

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

  const initialEditing = sp.edit ? await prisma.notice.findUnique({ where: { id: sp.edit }, select: { id: true, title: true, category: true, isPublished: true, content: true } }) : null;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <NoticesManager
      initialEditing={initialEditing}
      focusEditor={!!sp.edit || sp.new === "1"}
      notices={notices}
      q={q}
      page={page}
      totalPages={totalPages}
      total={total}
      initialMobileView={sp.edit || sp.new === "1" ? "write" : sp.view === "browse" || !!q || page > 1 ? "browse" : "write"}
    />
  );
}
