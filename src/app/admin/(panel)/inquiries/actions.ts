"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function markInquiryRead(id: string, read: boolean) {
  await requireAdmin();
  await prisma.contactInquiry.update({ where: { id }, data: { isRead: read } });
  revalidatePath("/admin/inquiries");
}

export async function deleteInquiry(id: string) {
  await requireAdmin();
  await prisma.contactInquiry.delete({ where: { id } });
  revalidatePath("/admin/inquiries");
}
