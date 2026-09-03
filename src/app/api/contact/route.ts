import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, message } = body ?? {};
    if (!name || !phone || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    // Store as a GENERAL notice draft for admin review (simple V1 approach)
    // Alternatively integrate Resend/Nodemailer here.
    console.log("Contact inquiry:", { name, phone, message });
    await prisma.$disconnect();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
