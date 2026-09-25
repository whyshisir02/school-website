import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import PrintButton from "@/components/PrintButton";
import NoticeLetterhead from "@/components/NoticeLetterhead";
import NoticePrintFit from "@/components/NoticePrintFit";

export const revalidate = 3600;

async function getNotice(slug: string) {
  return prisma.notice.findFirst({
    where: { slug, isPublished: true },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const notice = await getNotice(slug);
  if (!notice) return { title: "Notice Not Found" };
  return {
    title: notice.title,
    description: notice.content.replace(/<[^>]+>/g, "").slice(0, 150),
  };
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const notice = await getNotice(slug);
  if (!notice) notFound();

  const [prev, next] = await Promise.all([
    prisma.notice.findFirst({
      where: { isPublished: true, publishedAt: { lt: notice.publishedAt ?? notice.createdAt } },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, title: true },
    }),
    prisma.notice.findFirst({
      where: { isPublished: true, publishedAt: { gt: notice.publishedAt ?? notice.createdAt } },
      orderBy: { publishedAt: "asc" },
      select: { slug: true, title: true },
    }),
  ]);

  const d = notice.publishedAt ?? notice.createdAt;
  const dateLabel = `${d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} (${d.toLocaleDateString("en-GB", { weekday: "long" })})`;

  return (
    <>
      <div className="print:hidden">
        <PageHeader title="Notice" breadcrumb={`Notices / ${notice.category}`} />
      </div>

      {/* Print button (hidden when printing) */}
      <div className="container-page max-w-[820px] pt-6 print:hidden">
        <PrintButton />
      </div>

      {/* Official-letterpad notice sheet (screen + A4 print) */}
      <article className="container-page max-w-[820px] py-8 print:max-w-none print:p-0 print:py-0">
        <NoticePrintFit />
        <NoticeLetterhead title={notice.title} dateLabel={dateLabel} html={notice.content} />

        {/* Prev/next nav (hidden when printing) */}
        <div className="mt-10 flex justify-between border-t pt-6 text-sm print:hidden">
          {prev ? (
            <Link href={`/notices/${prev.slug}`} className="text-navy hover:text-gold-dark">
              ← {prev.title.slice(0, 30)}…
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/notices/${next.slug}`} className="ml-auto text-navy hover:text-gold-dark">
              {next.title.slice(0, 30)}… →
            </Link>
          )}
        </div>
      </article>
    </>
  );
}
