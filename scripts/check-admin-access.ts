import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { encode } from "next-auth/jwt";
loadEnvConfig(process.cwd());
const db = new PrismaClient();
const base = process.env.ACCESS_TEST_URL ?? "http://127.0.0.1:3001";
let temporaryId: string | undefined;
async function main() {
  const admin = await db.user.create({ data: { email: `access-test-${randomUUID()}@example.invalid`, passwordHash: "no-login-password", role: "ADMIN" } });
  temporaryId = admin.id;
  assert.deepEqual(admin.permissions, ["GALLERY", "NOTICES", "FACULTY"]);
  const owner = await db.user.findUniqueOrThrow({ where: { email: "shisir@super.admin" } });
  assert.equal(owner.role, "SUPER_ADMIN");
  async function cookie(user: typeof admin) {
    // Deliberately forge a privileged role claim: authorization must use the DB role.
    return "next-auth.session-token=" + await encode({ secret: process.env.NEXTAUTH_SECRET!, token: { uid: user.id, sub: user.id, role: "SUPER_ADMIN", ver: user.tokenVersion }, maxAge: 180 });
  }
  const adminCookie = await cookie(admin), ownerCookie = await cookie(owner);
  async function request(path: string, cookieValue = adminCookie, method = "GET") {
    return fetch(base + path, { method, redirect: "manual", headers: { cookie: cookieValue } });
  }
  const dashboard = await request("/admin/dashboard");
  assert.equal(dashboard.status, 200);
  const html = await dashboard.text();
  assert.ok(!html.includes('href="/admin/settings"'));
  assert.ok(!html.includes('href="/admin/inquiries"'));
  assert.ok(html.includes('href="/admin/settings/security"'));
  for (const path of ["/admin/gallery", "/admin/notices", "/admin/announcements", "/admin/staff", "/admin/settings/security"]) assert.equal((await request(path)).status, 200, path);
  assert.equal((await fetch(base + "/api/admin/announcements/upload", { method: "POST" })).status, 401);
  assert.equal((await request("/admin/announcements", ownerCookie)).status, 200);
  const emptyUpload = await fetch(base + "/api/admin/announcements/upload", { method: "POST", headers: { Cookie: adminCookie }, body: new FormData() });
  assert.equal(emptyUpload.status, 400);
  const activeAnnouncement = await fetch(base + "/api/announcements/active");
  assert.equal(activeAnnouncement.status, 200);
  assert.ok(activeAnnouncement.headers.get("cache-control")?.includes("no-store"));
  const publicPoster = await activeAnnouncement.json();
  assert.ok(publicPoster === null || !("draft" in publicPoster) && !("publicId" in publicPoster));
  for (const path of ["/admin/settings", "/admin/settings/branding", "/admin/settings/hero", "/admin/settings/messages", "/admin/inquiries", "/admin/users", "/admin/activity"]) {
    const response = await request(path); assert.equal(response.status, 307, path);
    assert.ok(response.headers.get("location")?.endsWith("/admin/access-denied"));
  }
  assert.equal((await request("/api/admin/hero/upload", adminCookie, "POST")).status, 403);
  assert.equal((await fetch(base + "/api/admin/gallery/upload", { method: "POST" })).status, 401);
  assert.equal((await request("/admin/settings", ownerCookie)).status, 200);
  assert.equal((await request("/admin/settings/branding", ownerCookie)).status, 200);
  assert.equal((await request("/api/admin/branding/upload", adminCookie, "POST")).status, 403);
  assert.equal((await fetch(base + "/api/admin/branding/upload", { method: "POST" })).status, 401);
  assert.equal((await request("/api/admin/branding/upload", ownerCookie, "POST")).status, 503);
  const userManagement = await request("/admin/users", ownerCookie);
  assert.equal(userManagement.status, 200);
  assert.ok((await userManagement.text()).includes("Add school admin"));
  assert.equal((await fetch(base + "/account/setup")).status, 200);
  const activity = await request("/admin/activity", ownerCookie);
  assert.equal(activity.status, 200);
  assert.ok((await activity.text()).includes("Activity log"));
  await db.user.update({ where: { id: admin.id }, data: { permissions: ["GALLERY", "NOTICES", "FACULTY", "INQUIRIES"] } });
  assert.equal((await request("/admin/inquiries")).status, 200);
  await db.user.update({ where: { id: admin.id }, data: { permissions: [] } });
  assert.equal((await request("/admin/announcements")).status, 307);
  assert.equal((await request("/api/admin/announcements/upload", adminCookie, "POST")).status, 403);
  assert.equal((await request("/admin/gallery")).status, 307);
  assert.equal((await request("/api/admin/gallery/upload", adminCookie, "POST")).status, 403);
  await db.user.update({ where: { id: admin.id }, data: { isActive: false } });
  assert.ok((await request("/admin/dashboard")).headers.get("location")?.includes("/admin/login"));
  assert.equal((await request("/api/admin/gallery/upload", adminCookie, "POST")).status, 401);
  console.log("Access checks passed: defaults, protected pages/uploads, navigation, forged role, live grants/revocation and disabled accounts.");
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(async () => {
  if (temporaryId) await db.user.delete({ where: { id: temporaryId } });
  await db.$disconnect();
});
