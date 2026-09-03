import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/auth-helpers";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  await requireAdmin();
  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Max file size is 5MB" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const b64 = `data:${file.type};base64,${buf.toString("base64")}`;
  const result = await cloudinary.uploader.upload(b64, {
    folder: "eastern-view/notices",
    transformation: [{ quality: "auto", fetch_format: "auto", width: 1200, crop: "limit" }],
  });

  return NextResponse.json({ ok: true, url: result.secure_url, publicId: result.public_id });
}
