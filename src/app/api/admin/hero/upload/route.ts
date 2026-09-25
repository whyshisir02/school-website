import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/auth-helpers";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Single-image upload for the homepage hero slideshow. Mirrors the notices
 * upload route but stores in a dedicated Cloudinary folder and caps the width
 * higher (1920) since the hero is full-bleed. Returns { url, publicId }; the
 * admin form appends the result to the slide list and persists via
 * saveHeroSlides.
 */
export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Max file size is 5MB" }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Use JPEG, PNG, or WebP." },
      { status: 400 }
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const b64 = `data:${file.type};base64,${buf.toString("base64")}`;
  const result = await cloudinary.uploader.upload(b64, {
    folder: "eastern-view/hero",
    transformation: [{ width: 1920, crop: "limit", quality: "auto", fetch_format: "auto" }],
  });

  return NextResponse.json({ ok: true, url: result.secure_url, publicId: result.public_id });
}
