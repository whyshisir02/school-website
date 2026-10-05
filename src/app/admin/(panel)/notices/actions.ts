"use server";
import { auditTransaction } from "@/lib/audit";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import { requireAdmin } from "@/lib/auth-helpers";
import { sanitizeNoticeHtml } from "@/lib/sanitize";

export async function saveNotice(formData: FormData) {
  const session = await requireAdmin("NOTICES");
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = sanitizeNoticeHtml(String(formData.get("content") ?? "").trim());
  const category = String(formData.get("category") ?? "GENERAL");
  const isPublished = formData.get("isPublished") === "on";

  if (!title || !content) return;

  const data = {
    title,
    content,
    category: category as never,
    isPublished,
    publishedAt: isPublished ? new Date() : null,
  };

  if (id) {
    const existing = await prisma.notice.findUniqueOrThrow({ where: { id }, select: { isPublished: true, publishedAt: true } });
    if (isPublished && existing.isPublished && existing.publishedAt) data.publishedAt = existing.publishedAt;
    await auditTransaction(session, { action: "NOTICE_SAVED", targetId: id, details: { published: isPublished } }, (tx) => tx.notice.update({ where: { id }, data }));
  } else {
    let slug = slugify(title);
    const exists = await prisma.notice.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now().toString(36)}`;
    await auditTransaction<{ id: string }>(session, (notice) => ({ action: "NOTICE_SAVED", targetId: notice.id, details: { published: isPublished } }), (tx) => tx.notice.create({ data: { ...data, slug } }));
  }

  revalidatePath("/admin/notices");
  revalidatePath("/notices");
  revalidatePath("/notices/[slug]", "page");
  revalidatePath("/");
}

export async function toggleNoticePublish(id: string, publish: boolean) {
  const session = await requireAdmin("NOTICES");
  await auditTransaction(session, { action: publish ? "NOTICE_PUBLISHED" : "NOTICE_UNPUBLISHED", targetId: id }, (tx) => tx.notice.update({
    where: { id },
    data: { isPublished: publish, publishedAt: publish ? new Date() : null },
  }));
  revalidatePath("/admin/notices");
  revalidatePath("/notices");
  revalidatePath("/notices/[slug]", "page");
  revalidatePath("/");
}

export async function deleteNotice(id: string) {
  const session = await requireAdmin("NOTICES");
  await auditTransaction(session, { action: "NOTICE_DELETED", targetId: id }, (tx) => tx.notice.delete({ where: { id } }));
  revalidatePath("/");
  revalidatePath("/admin/notices");
  revalidatePath("/notices");
  revalidatePath("/notices/[slug]", "page");
}
