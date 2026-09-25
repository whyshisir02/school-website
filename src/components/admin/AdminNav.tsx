"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FiLogOut } from "react-icons/fi";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/notices", label: "Notices" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/inquiries", label: "Inquiries", showUnread: true },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();
  return (
    <header className="bg-navy text-white">
      <div className="container-page flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo → back to the public site home page (same tab). */}
          <Link
            href="/"
            title="Go to the school website"
            className="rounded-full transition hover:opacity-80"
          >
            <Image
              src="/images/logo.png"
              alt="Go to school website"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full bg-white object-contain p-0.5"
            />
          </Link>
          {/* Wordmark → dashboard. */}
          <Link href="/admin/dashboard" className="font-heading font-bold">
            EV Admin
          </Link>
        </div>
        <nav className="flex items-center gap-1 sm:gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium ${
                pathname.startsWith(l.href) ? "bg-gold text-white" : "hover:bg-white/10"
              }`}
            >
              {l.label}
              {l.showUnread && unreadCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
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
