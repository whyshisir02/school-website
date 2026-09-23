import { prisma } from "@/lib/db";
import InquiryRow from "@/components/admin/InquiryRow";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const inquiries = await prisma.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const unread = inquiries.filter((i) => !i.isRead).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contact Inquiries</h1>
        <span className="rounded-full bg-gold/10 px-3 py-1 text-sm font-semibold text-gold-dark">
          {unread} unread
        </span>
      </div>

      {inquiries.length === 0 ? (
        <p className="mt-8 rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          No inquiries yet. Messages from the contact form will appear here.
        </p>
      ) : (
        <ul className="mt-4 divide-y rounded-xl bg-white shadow-sm">
          {inquiries.map((i) => (
            <InquiryRow key={i.id} inquiry={i} />
          ))}
        </ul>
      )}
    </div>
  );
}
