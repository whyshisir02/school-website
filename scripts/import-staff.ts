import { PrismaClient } from "@prisma/client";
import { STAFF, staffPhoto } from "../src/lib/staff";
import { SCHOOL } from "../src/lib/school";

const prisma = new PrismaClient();
async function main() {
  await prisma.$transaction(async (tx) => {
    if (await tx.staffMember.count()) { console.log("Staff records already exist; no changes made."); return; }
    for (const [order, person] of STAFF.entries()) {
      const member = await tx.staffMember.create({ data: { name: person.name, position: person.role, subject: person.subject ?? "", group: person.role === "Principal" ? "LEADERSHIP" : "TEACHING", status: "PUBLISHED", order, photoUrl: staffPhoto(person.slug) ?? (person.role === "Principal" ? staffPhoto("jb-magar") : null) } });
      if (person.role === "Principal") await tx.settings.upsert({ where: { id: "main" }, create: { id: "main", schoolName: SCHOOL.name, address: SCHOOL.address, phone: SCHOOL.phone, email: SCHOOL.email, principalStaffId: member.id }, update: { principalStaffId: member.id } });
    }
    console.log("Existing verified staff imported.");
  }, { timeout: 15000 });
}
main().finally(() => prisma.$disconnect());
