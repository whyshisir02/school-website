import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { AUDIT_EVENTS, safeAuditDetails, type AuditAction, type AuditDetails } from "./audit-events";
export type AuditActor = { id: string | null; email: string; role: string };
export type AuditEvent = { action: AuditAction; targetId?: string | null; details?: AuditDetails };
export function auditActor(session: { user?: { email?: string | null } }) : AuditActor {
  const user = session.user as { id?: string; email?: string; role?: string } | undefined;
  if (!user?.id || !user.email || !user.role) throw new Error("Cannot identify the account making this change.");
  return { id: user.id, email: user.email, role: user.role };
}
export async function writeAudit(tx: Prisma.TransactionClient, actor: AuditActor, event: AuditEvent) {
  return tx.activityLog.create({ data: { actorId: actor.id, actorEmail: actor.email, actorRole: actor.role, action: event.action, area: AUDIT_EVENTS[event.action][0], targetId: event.targetId, details: safeAuditDetails(event.details) } });
}
export async function auditTransaction<T>(session: Parameters<typeof auditActor>[0], event: AuditEvent | ((result: NoInfer<T>) => AuditEvent), work: (tx: Prisma.TransactionClient) => Promise<T>) {
  const actor = auditActor(session);
  return prisma.$transaction(async (tx) => {
    const result = await work(tx);
    await writeAudit(tx, actor, typeof event === "function" ? event(result) : event);
    return result;
  }, { timeout: 15000 });
}
