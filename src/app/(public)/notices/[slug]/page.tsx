import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import PrintButton from "@/components/PrintButton";
import { SCHOOL } from "@/lib/school";
import { existsSync } from "fs";
import path from "path";

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
  const hasLogo = existsSync(path.join(process.cwd(), "public", "images", "logo.png"));

  return (
    <>
      <PageHeader title="Notice" breadcrumb={`Notices / ${notice.category}`} />

      {/* Print button (hidden when printing) */}
      <div className="container-page max-w-3xl pt-6 print:hidden">
        <PrintButton />
      </div>

      {/* Letterhead-style notice sheet — modeled on the school's official letterpad */}
      <article className="container-page max-w-3xl py-8 print:py-0">
        <div className="overflow-hidden rounded-xl border-2 border-red-600 bg-white shadow-sm print:rounded-none print:border-2 print:shadow-none">
          {/* Letterhead header */}
          <header className="relative bg-white px-6 pb-4 pt-6 text-center sm:px-10">
            <div className="flex items-center justify-center gap-4">
              {/* Logo — shown only if /public/images/logo.png exists */}
              {hasLogo && (
                <Image
                  src="/images/logo.png"
                  alt={`${SCHOOL.name} logo`}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full object-contain print:h-24 print:w-24"
                />
              )}
              <div>
                <h2 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-amber-600 sm:text-3xl">
                  Shree Eastern View
                </h2>
                <p className="font-heading text-xl font-bold uppercase text-red-700 sm:text-2xl">
                  English School
                </p>
                <p className="text-sm font-semibold text-green-700">
                  {SCHOOL.address}
                </p>
                <p className="text-xs font-bold text-slate-700">
                  ESTD: {SCHOOL.established} B.S. &nbsp;·&nbsp; Comp. Regd. No. {SCHOOL.regdNo}
                </p>
              </div>
            </div>
            {/* Green wave accent */}
            <div className="mt-3 h-2 w-full rounded-full bg-gradient-to-r from-green-600 via-green-500 to-blue-600 print:h-1.5" />
          </header>

          {/* Date */}
          <div className="px-6 text-right text-sm text-slate-700 sm:px-10">
            Date: {d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}{" "}
            ({d.toLocaleDateString("en-GB", { weekday: "long" })})
          </div>

          {/* Title */}
          <div className="px-6 sm:px-10">
            <h1 className="mt-6 text-center font-heading text-2xl font-extrabold uppercase tracking-wide text-red-700 underline decoration-2 underline-offset-8 sm:text-3xl">
              {notice.title}
            </h1>

            <div
              className="prose prose-slate mt-8 max-w-none"
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />

            {/* Signature block */}
            <div className="mt-14 flex justify-end print:mt-20">
              <div className="text-center">
                <div className="h-14" /> {/* space for signature */}
                <p className="border-t border-slate-500 px-8 pt-1 font-heading text-base font-bold text-navy">
                  {SCHOOL.principalName}
                </p>
                <p className="text-sm font-bold tracking-wide text-slate-700">PRINCIPAL</p>
              </div>
            </div>
          </div>

          {/* Contact footer bar */}
          <footer className="mt-8 bg-blue-700 px-6 py-4 text-center text-white sm:px-10">
            <p className="text-sm font-semibold">✉️ {SCHOOL.email}</p>
            <p className="text-sm font-semibold">📞 {SCHOOL.phones.join(", ")}</p>
          </footer>
        </div>

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
