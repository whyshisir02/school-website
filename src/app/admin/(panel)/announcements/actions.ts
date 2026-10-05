"use server";
import { requireAdmin } from "@/lib/auth-helpers";
import { auditTransaction } from "@/lib/audit";
import { saveAnnouncementState } from "@/lib/announcement-service";
import type { AnnouncementIntent, AnnouncementState } from "@/lib/announcement";
import { revalidatePath } from "next/cache";

export async function saveAnnouncement(revision: string, intent: AnnouncementIntent, input: unknown): Promise<{ state?: AnnouncementState; error?: string }> {
  const session = await requireAdmin("NOTICES");
  const events = { draft: "ANNOUNCEMENT_SAVED", publish: "ANNOUNCEMENT_PUBLISHED", hide: "ANNOUNCEMENT_HIDDEN", remove: "ANNOUNCEMENT_REMOVED" } as const;
  if (!Object.hasOwn(events, intent)) return { error: "Unknown announcement action." };
  try {
    const state = await auditTransaction(session, { action: events[intent], targetId: "main" }, (tx) => saveAnnouncementState(tx, revision, intent, input));
    revalidatePath("/admin/announcements");
    return { state };
  } catch (error) {
    return { error: error instanceof Error && !("code" in error) ? error.message : "The announcement could not be saved. Please try again." };
  }
}
