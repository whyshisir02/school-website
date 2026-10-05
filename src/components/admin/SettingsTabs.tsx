"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { canAccess, routePermission, type Access } from "@/lib/permissions";
import { FiSettings, FiImage, FiMessageSquare, FiShield } from "react-icons/fi";
const tabs = [
  { href: "/admin/settings/branding", label: "Branding", icon: FiSettings },
  { href: "/admin/settings", label: "School details", icon: FiSettings },
  { href: "/admin/settings/hero", label: "Homepage photos", icon: FiImage },
  { href: "/admin/settings/messages", label: "Leadership messages", icon: FiMessageSquare },
  { href: "/admin/settings/security", label: "Account security", icon: FiShield },
];
export default function SettingsTabs({ access }: { access: Access }) {
  const pathname = usePathname();
  return <nav aria-label="Settings sections" className="mt-6 grid gap-2 rounded-2xl border border-slate-200 bg-white p-2 sm:grid-cols-2 xl:grid-cols-4">
    {tabs.filter((tab) => { const permission = routePermission(tab.href); return !permission || canAccess(access, permission); }).map((tab) => {
      const active = tab.href === "/admin/settings" ? pathname === tab.href : pathname.startsWith(tab.href);
      return <Link key={tab.href} href={tab.href} aria-current={active ? "page" : undefined} className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${active ? "bg-navy text-white" : "text-slate-500 hover:bg-slate-50"}`}><tab.icon />{tab.label}</Link>;
    })}
  </nav>;
}
