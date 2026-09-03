"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiLogOut } from "react-icons/fi";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/notices", label: "Notices" },
  { href: "/admin/gallery", label: "Gallery" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <header className="bg-navy text-white">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/admin/dashboard" className="font-heading font-bold">
          EV Admin
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                pathname.startsWith(l.href) ? "bg-gold text-white" : "hover:bg-white/10"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-1.5 text-sm hover:text-gold">
            <FiLogOut size={14} /> Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
