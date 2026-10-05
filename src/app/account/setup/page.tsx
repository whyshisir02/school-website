import type { Metadata } from "next";
import AccountSetupForm from "@/components/admin/AccountSetupForm";
export const metadata: Metadata = { title: "Set account password", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function AccountSetupPage() {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10"><AccountSetupForm /></main>;
}
