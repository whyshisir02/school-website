import { mediaFolder } from "@/lib/media-folder";
import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/db";
import { requireAdmin, ForbiddenError } from "@/lib/auth-helpers";
import { IMAGE_TYPES, IMAGE_MAX_BYTES } from "@/lib/image-upload-policy";

export async function POST(req: Request) {
  try { await requireAdmin("NOTICES"); } catch (error) { return NextResponse.json({ error: error instanceof ForbiddenError ? "Forbidden" : "Unauthorized" }, { status: error instanceof ForbiddenError ? 403 : 401 }); }
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size || file.size > IMAGE_MAX_BYTES || !IMAGE_TYPES.includes(file.type)) return NextResponse.json({ error: "Choose a JPEG, PNG or WebP image compressed below 700 KB." }, { status: 400 });
    const publicId = `${mediaFolder()}/announcements/${crypto.randomUUID()}`;
    await prisma.mediaCleanup.create({ data: { publicId, notBefore: new Date(Date.now() + 86400_000) } });
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await cloudinary.uploader.upload(`data:${file.type};base64,${buffer.toString("base64")}`, { public_id: publicId, overwrite: false, resource_type: "image" });
    return NextResponse.json({ ok: true, url: result.secure_url, publicId: result.public_id });
  } catch { return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 503 }); }
}
