import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const albumId = String(form.get("albumId") ?? "");
  const files = form.getAll("files") as File[];

  if (!albumId || files.length === 0) {
    return NextResponse.json({ error: "albumId and files required" }, { status: 400 });
  }

  const uploaded = [];
  let skipped = 0;
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      skipped++; // too large, or not a JPEG/PNG/WebP
      continue;
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const b64 = `data:${file.type};base64,${buf.toString("base64")}`;
    const result = await cloudinary.uploader.upload(b64, {
      folder: "eastern-view/gallery",
      transformation: [{ width: 1600, crop: "limit", quality: "auto", fetch_format: "auto" }],
    });
    uploaded.push({ url: result.secure_url, publicId: result.public_id });
  }

  if (uploaded.length === 0) {
    return NextResponse.json(
      { error: "No valid images. Use JPEG/PNG/WebP under 5MB." },
      { status: 400 }
    );
  }

  await prisma.galleryImage.createMany({
    data: uploaded.map((u, i) => ({
      albumId,
      url: u.url,
      publicId: u.publicId,
      order: i,
    })),
  });

  return NextResponse.json({ ok: true, count: uploaded.length, skipped });
}
