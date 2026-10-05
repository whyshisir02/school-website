import { cache } from "react";
import { prisma } from "./db";
export const getPublishedStaff = cache(() => prisma.staffMember.findMany({
  where: { status: "PUBLISHED" }, orderBy: [{ group: "asc" }, { order: "asc" }, { id: "asc" }],
  select: { id: true, name: true, position: true, group: true, subject: true, qualifications: true, bio: true, photoUrl: true },
}));
export const getPrincipalStaff = cache(async () => {
  const settings = await prisma.settings.findUnique({ where: { id: "main" }, select: { principalStaff: { select: { id: true, name: true, position: true, status: true, group: true, photoUrl: true } } } });
  const person = settings?.principalStaff;
  return person?.status === "PUBLISHED" && person.group === "LEADERSHIP" ? person : null;
});
