import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const MAX_NAME = 100;
const MAX_PHONE = 20;
const MAX_MESSAGE = 2000;

const MIN_SUBMIT_MS = 1500; // real visitors take longer than this to fill the form

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const honeypot = typeof body?.website === "string" ? body.website.trim() : "";
    const elapsedMs = typeof body?.elapsedMs === "number" ? body.elapsedMs : 0;

    // Bot signals: pretend success without writing anything, so scripts
    // don't get feedback that tells them what tripped the filter.
    if (honeypot || elapsedMs < MIN_SUBMIT_MS) {
      return NextResponse.json({ ok: true });
    }

    if (!name || !phone || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (name.length > MAX_NAME || phone.length > MAX_PHONE || message.length > MAX_MESSAGE) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    // Persist so the school never loses an admission inquiry.
    await prisma.contactInquiry.create({ data: { name, phone, message } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
