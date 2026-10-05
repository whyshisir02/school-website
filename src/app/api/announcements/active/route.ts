import { prisma } from "@/lib/db";
import { readAnnouncementState, announcementStatus, announcementTime } from "@/lib/announcement";
import { isSchoolUpload } from "@/lib/media-folder";

export const dynamic = "force-dynamic";
export async function GET() {
  const headers = { "Cache-Control": "no-store, max-age=0" };
  try {
    const row = await prisma.settings.findUnique({ where: { id: "main" }, select: { announcement: true } });
    const { live } = readAnnouncementState(row?.announcement);
    if (!live || announcementStatus(live) !== "Live" || !isSchoolUpload(live.url, live.publicId, "announcements", process.env.CLOUDINARY_CLOUD_NAME || "")) return Response.json(null, { headers });
    return Response.json({ title: live.title, description: live.description, url: live.url, link: live.link, expiresAt: announcementTime(live.endBS) }, { headers });
  } catch { return Response.json(null, { status: 503, headers }); }
}
