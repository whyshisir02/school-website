"use server";
import { auditTransaction } from "@/lib/audit";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function markInquiryRead(id: string, read: boolean) {
  const session = await requireAdmin("INQUIRIES");
  await auditTransaction(session, { action: read ? "INQUIRY_READ" : "INQUIRY_UNREAD", targetId: id }, (tx) => tx.contactInquiry.update({ where: { id }, data: { isRead: read } }));
  revalidatePath("/admin/inquiries");
}

export async function deleteInquiry(id: string) {
  const session = await requireAdmin("INQUIRIES");
  await auditTransaction(session, { action: "INQUIRY_DELETED", targetId: id }, (tx) => tx.contactInquiry.delete({ where: { id } }));
  revalidatePath("/admin/inquiries");
}
