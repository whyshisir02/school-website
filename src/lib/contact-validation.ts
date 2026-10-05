type Inquiry = { name: string; phone: string; message: string };
export function validateContactInquiry(body: unknown): { ok: true; data: Inquiry } | { ok: false; error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, error: "Invalid request." };
  const input = body as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";
  if (typeof input.website === "string" && input.website.trim()) return { ok: false, error: "Could not send this message. Please try again or call the school." };
  if (!name || !phone || !message) return { ok: false, error: "Please enter your name, phone number and message." };
  if (name.length > 100 || phone.length > 20 || message.length > 2000) return { ok: false, error: "Your message or contact details are too long." };
  // Submission speed is not evidence of spam: autofill and assistive tools can be fast.
  return { ok: true, data: { name, phone, message } };
}
