import { getSiteSettings } from "@/lib/settings";
import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin Login" };

export default async function AdminLoginPage() {
  const settings = await getSiteSettings();
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-navy/5 px-4">
      <Suspense>
        <LoginForm name={settings.name} logo={settings.branding.logo?.url} />
      </Suspense>
    </div>
  );
}
