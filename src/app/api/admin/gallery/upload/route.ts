import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  await requireAdmin();
  const form = await req.formData();
  const albumId = String(form.get("albumId") ?? "");
  const files = form.getAll("files") as File[];

  if (!albumId || files.length === 0) {
    return NextResponse.json({ error: "albumId and files required" }, { status: 400 });
  }

  const uploaded = [];
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) continue; // 5MB limit
    const buf = Buffer.from(await file.arrayBuffer());
    const b64 = `data:${file.type};base64,${buf.toString("base64")}`;
    const result = await cloudinary.uploader.upload(b64, {
      folder: "eastern-view/gallery",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
    uploaded.push({ url: result.secure_url, publicId: result.public_id });
  }

  await prisma.galleryImage.createMany({
    data: uploaded.map((u, i) => ({
      albumId,
      url: u.url,
      publicId: u.publicId,
      order: i,
    })),
  });

  return NextResponse.json({ ok: true, count: uploaded.length });
}
