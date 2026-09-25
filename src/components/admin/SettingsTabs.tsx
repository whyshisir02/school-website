"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Sub-navigation for the Settings area. Each tab is a real route under
// /admin/settings so it's bookmarkable and only loads its own data.
const tabs = [
  { href: "/admin/settings", label: "General" },
  { href: "/admin/settings/hero", label: "Homepage Hero" },
  { href: "/admin/settings/messages", label: "Messages" },
  { href: "/admin/settings/security", label: "Security" },
];

export default function SettingsTabs() {
  const pathname = usePathname();
  return (
    <nav className="mt-6 flex flex-wrap gap-1 border-b border-slate-200">
      {tabs.map((t) => {
        // "General" is the index route, so match it exactly; the others are
        // active whenever the path is within them.
        const active =
          t.href === "/admin/settings"
            ? pathname === "/admin/settings"
            : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              active
                ? "border-gold text-navy"
                : "border-transparent text-slate-500 hover:text-navy"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
