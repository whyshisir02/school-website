"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import { requireAdmin } from "@/lib/auth-helpers";
import { sanitizeNoticeHtml } from "@/lib/sanitize";

export async function saveNotice(formData: FormData) {
  await requireAdmin();
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
    await prisma.notice.update({ where: { id }, data });
  } else {
    let slug = slugify(title);
    const exists = await prisma.notice.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now().toString(36)}`;
    await prisma.notice.create({ data: { ...data, slug } });
  }

  revalidatePath("/admin/notices");
  revalidatePath("/notices");
  revalidatePath("/");
}

export async function toggleNoticePublish(id: string, publish: boolean) {
  await requireAdmin();
  await prisma.notice.update({
    where: { id },
    data: { isPublished: publish, publishedAt: publish ? new Date() : null },
  });
  revalidatePath("/admin/notices");
  revalidatePath("/notices");
  revalidatePath("/");
}

export async function deleteNotice(id: string) {
  await requireAdmin();
  await prisma.notice.delete({ where: { id } });
  revalidatePath("/admin/notices");
  revalidatePath("/notices");
}
