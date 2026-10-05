import { Prisma } from "@prisma/client";
import { isStaffUpload } from "./staff-validation";
import type { StaffInput, StaffGroup } from "./staff-types";

const defaults = { schoolName: "School", address: "", phone: "", email: "" };
export async function saveStaffRecord(tx: Prisma.TransactionClient, input: StaffInput) {
  const existing = input.id ? await tx.staffMember.findUnique({ where: { id: input.id } }) : null;
  if (input.id && !existing) throw new Error("This profile no longer exists.");
  if (existing && existing.updatedAt.toISOString() !== input.updatedAt) throw new Error("This profile changed in another session. Reload before saving.");
  const samePhoto = existing?.photoUrl === input.photoUrl && existing?.publicId === input.publicId;
  if (input.photoUrl && !samePhoto) {
    if (!input.publicId || !isStaffUpload(input.photoUrl, input.publicId, process.env.CLOUDINARY_CLOUD_NAME ?? "")) throw new Error("Upload the portrait using the photo picker.");
    const pending = await tx.mediaCleanup.findUnique({ where: { publicId: input.publicId } });
    if (!pending || pending.notBefore <= new Date()) throw new Error("This photo upload has expired. Upload it again.");
    if (await tx.staffMember.count({ where: { publicId: input.publicId } })) throw new Error("This upload is already assigned to another profile.");
  }
  const max = !existing || existing.group !== input.group ? await tx.staffMember.aggregate({ where: { group: input.group }, _max: { order: true } }) : null;
  const data = { name: input.name, position: input.position, group: input.group, status: input.status,
    subject: input.subject, qualifications: input.qualifications, bio: input.bio, photoUrl: input.photoUrl, publicId: input.publicId,
    order: max ? (max._max.order ?? -1) + 1 : existing!.order };
  const member = existing ? await tx.staffMember.update({ where: { id: existing.id }, data }) : await tx.staffMember.create({ data });
  if (input.isPrincipal) {
    await tx.settings.upsert({ where: { id: "main" }, create: { id: "main", ...defaults, principalStaffId: member.id }, update: { principalStaffId: member.id } });
  } else {
    await tx.settings.updateMany({ where: { id: "main", principalStaffId: member.id }, data: { principalStaffId: null } });
  }
  if (input.publicId) await tx.mediaCleanup.deleteMany({ where: { publicId: input.publicId } });
  if (existing?.publicId && existing.publicId !== input.publicId) {
    await tx.mediaCleanup.upsert({ where: { publicId: existing.publicId }, create: { publicId: existing.publicId }, update: { notBefore: new Date() } });
  }
  return member;
}
export async function archiveStaffRecord(tx: Prisma.TransactionClient, id: string) {
  if (await tx.settings.count({ where: { principalStaffId: id } })) throw new Error("Choose another principal, or uncheck the principal assignment in this profile before archiving.");
  await tx.staffMember.update({ where: { id }, data: { status: "ARCHIVED" } });
}
export async function deleteStaffRecord(tx: Prisma.TransactionClient, id: string) {
  const member = await tx.staffMember.findUniqueOrThrow({ where: { id } });
  if (member.status !== "ARCHIVED") throw new Error("Archive this profile before permanently deleting it.");
  if (await tx.settings.count({ where: { principalStaffId: id } })) throw new Error("Remove the principal assignment before deleting this profile.");
  await tx.staffMember.delete({ where: { id } });
  if (member.publicId) await tx.mediaCleanup.upsert({ where: { publicId: member.publicId }, create: { publicId: member.publicId }, update: { notBefore: new Date() } });
}
export async function reorderStaffRecords(tx: Prisma.TransactionClient, group: StaffGroup, ids: string[]) {
  const members = await tx.staffMember.findMany({ where: { group }, select: { id: true } });
  if (ids.length !== members.length || new Set(ids).size !== ids.length || members.some((m) => !ids.includes(m.id))) throw new Error("The staff list changed. Reload before reordering.");
  for (const [order, id] of ids.entries()) await tx.staffMember.update({ where: { id }, data: { order } });
}
