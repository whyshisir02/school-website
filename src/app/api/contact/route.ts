import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { validateContactInquiry } from "@/lib/contact-validation";

export async function POST(req: Request) {
  const { allowed, retryAfterSec } = rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429, headers: { "Retry-After": String(retryAfterSec) } });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const result = validateContactInquiry(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  try {
    await prisma.contactInquiry.create({ data: result.data });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "We could not save your message. Please try again or call the school." }, { status: 503 });
  }
}
