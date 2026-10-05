import { mediaFolder } from "@/lib/media-folder";
import { auditTransaction } from "@/lib/audit";
import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/db";
import { requireAdmin, ForbiddenError } from "@/lib/auth-helpers";
import { IMAGE_TYPES, IMAGE_MAX_BYTES } from "@/lib/image-upload-policy";
import { revalidatePath } from "next/cache";
import { validBsYear } from "@/lib/gallery-year";
export async function POST(req: Request) {
  let session;
  try { session = await requireAdmin("GALLERY"); } catch (error) { return NextResponse.json({ error: error instanceof ForbiddenError ? "Forbidden" : "Unauthorized" }, { status: error instanceof ForbiddenError ? 403 : 401 }); }
  try {
    const form = await req.formData();
    const albumId = String(form.get("albumId") ?? "");
    const eventBsYear = Number(form.get("eventBsYear"));
    const files = form.getAll("files");
    if (!albumId || files.length !== 1) return NextResponse.json({ error: "Select one photo and an album per request." }, { status: 400 });
    if (!validBsYear(eventBsYear)) return NextResponse.json({ error: "Choose a valid BS event year before uploading." }, { status: 400 });
    if (!await prisma.galleryAlbum.findUnique({ where: { id: albumId }, select: { id: true } })) return NextResponse.json({ error: "Album not found." }, { status: 404 });
    const file = files[0];
    if (!(file instanceof File) || !file.size || file.size > IMAGE_MAX_BYTES || !IMAGE_TYPES.includes(file.type)) return NextResponse.json({ error: "Use JPEG/PNG/WebP compressed to 700 KB or less." }, { status: 400 });
    // Pre-register the public ID before uploading, so interrupted requests can be cleaned up.
    const publicId = `${mediaFolder()}/gallery/${crypto.randomUUID()}`;
    await prisma.mediaCleanup.create({ data: { publicId, notBefore: new Date(Date.now() + 86400_000) } });
    const buf = Buffer.from(await file.arrayBuffer());
    const result = await cloudinary.uploader.upload(`data:${file.type};base64,${buf.toString("base64")}`, { public_id: publicId, overwrite: false });
    await auditTransaction(session, { action: "PHOTO_UPLOADED", targetId: publicId, details: { destinationId: albumId, year: eventBsYear, count: 1 } }, async (tx) => {
      await tx.galleryImage.create({ data: { albumId, url: result.secure_url, publicId: result.public_id, eventBsYear } });
      await tx.mediaCleanup.deleteMany({ where: { publicId } });
    });
    revalidatePath("/"); revalidatePath("/gallery"); revalidatePath("/admin/gallery");
    return NextResponse.json({ ok: true, count: 1 });
  } catch {
    return NextResponse.json({ error: "Photo could not be saved. Please try again." }, { status: 503 });
  }
}
