"use server";
import { auditActor, writeAudit, type AuditEvent } from "@/lib/audit";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { cleanUnusedMedia } from "@/lib/media-cleanup";
import { validateStaff } from "@/lib/staff-validation";
import { STAFF_GROUPS, type StaffGroup } from "@/lib/staff-types";
import { saveStaffRecord, archiveStaffRecord, deleteStaffRecord, reorderStaffRecords } from "@/lib/staff-service";

type Result = { ok: true; id?: string } | { ok: false; error: string };
async function transaction<T>(session: Parameters<typeof auditActor>[0], event: AuditEvent | ((result: NoInfer<T>) => AuditEvent), work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try { return await prisma.$transaction(async (tx) => { const result = await work(tx); await writeAudit(tx, auditActor(session), typeof event === "function" ? event(result) : event); return result; }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 15000 }); }
    catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034" && attempt < 2) continue; throw error; }
  }
}
function refresh() { revalidatePath("/admin/staff"); revalidatePath("/about"); revalidatePath("/"); }
function failure(error: unknown): Result {
  return { ok: false, error: error instanceof Error && !(error instanceof Prisma.PrismaClientKnownRequestError) ? error.message : "Could not save this change. Please reload and try again." };
}
export async function saveStaff(input: unknown): Promise<Result> {
  const session = await requireAdmin("FACULTY");
  const checked = validateStaff(input);
  if (!checked.ok) return checked;
  try {
    const member = await transaction<Awaited<ReturnType<typeof saveStaffRecord>>>(session, (member) => ({ action: "STAFF_SAVED", targetId: member.id }), (tx) => saveStaffRecord(tx, checked.data));
    refresh();
    await cleanUnusedMedia().catch(() => null);
    return { ok: true, id: member.id };
  } catch (error) { return failure(error); }
}
export async function archiveStaff(id: string): Promise<Result> {
  const session = await requireAdmin("FACULTY");
  try { await transaction(session, { action: "STAFF_ARCHIVED", targetId: id }, (tx) => archiveStaffRecord(tx, id)); refresh(); return { ok: true }; }
  catch (error) { return failure(error); }
}
export async function deleteStaff(id: string): Promise<Result> {
  const session = await requireAdmin("FACULTY");
  try {
    await transaction(session, { action: "STAFF_DELETED", targetId: id }, (tx) => deleteStaffRecord(tx, id)); refresh();
    await cleanUnusedMedia().catch(() => null);
    return { ok: true };
  } catch (error) { return failure(error); }
}
export async function reorderStaff(group: StaffGroup, ids: string[]): Promise<Result> {
  const session = await requireAdmin("FACULTY");
  if (!Object.hasOwn(STAFF_GROUPS, group) || !Array.isArray(ids) || ids.some((id) => typeof id !== "string")) return { ok: false, error: "Invalid staff order." };
  try { await transaction(session, { action: "STAFF_REORDERED", targetId: group, details: { count: ids.length } }, (tx) => reorderStaffRecords(tx, group, ids)); refresh(); return { ok: true }; }
  catch (error) { return failure(error); }
}
