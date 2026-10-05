"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import SchoolLogo from "@/components/SchoolLogo";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { canAccess, routePermission, type Access } from "@/lib/permissions";
import { FiLogOut, FiGrid, FiFileText, FiImage, FiMail, FiSettings, FiMenu, FiX, FiExternalLink, FiChevronsLeft, FiChevronsRight, FiUsers } from "react-icons/fi";

const links = [
  { href: "/admin/dashboard", label: "Overview", icon: FiGrid },
  { href: "/admin/notices", label: "Notices", icon: FiFileText },
  { href: "/admin/announcements", label: "Announcements", icon: FiImage },
  { href: "/admin/gallery", label: "Photo gallery", icon: FiImage },
  { href: "/admin/staff", label: "Faculty & staff", icon: FiUsers },
  { href: "/admin/inquiries", label: "Inquiries", icon: FiMail },
  { href: "/admin/settings", label: "Settings", icon: FiSettings },
  { href: "/admin/users", label: "User management", icon: FiUsers },
  { href: "/admin/activity", label: "Activity log", icon: FiFileText },
  { href: "/admin/settings/hero", label: "Homepage photos", icon: FiImage },
  { href: "/admin/settings/messages", label: "Leadership messages", icon: FiFileText },
  { href: "/admin/settings/security", label: "Account security", icon: FiSettings },
];
const preferenceKey = "ev-admin-sidebar-collapsed";

export default function AdminNav({ unreadCount = 0, access, name, logo }: { name: string; logo?: string; unreadCount?: number; access: Access }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(preferenceKey) === "1";
    setCollapsed(saved);
    document.documentElement.dataset.adminSidebar = saved ? "collapsed" : "expanded";
  }, []);
  useEffect(() => {
    document.documentElement.dataset.adminSidebar = collapsed ? "collapsed" : "expanded";
    window.localStorage.setItem(preferenceKey, collapsed ? "1" : "0");
    return () => { delete document.documentElement.dataset.adminSidebar; };
  }, [collapsed]);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const navigation = (compact: boolean) => <nav aria-label="Admin navigation" className="space-y-2">
    {links.filter((link) => {
      if (access.role === "SUPER_ADMIN" && (link.href === "/admin/settings/hero" || link.href === "/admin/settings/messages")) return false;
      const permission = routePermission(link.href);
      return !permission || canAccess(access, permission);
    }).map((link) => {
      const active = link.href === "/admin/settings" ? pathname === link.href : pathname.startsWith(link.href);
      return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}
        aria-label={compact ? link.label : undefined} title={compact ? link.label : undefined}
        className={`relative flex min-h-12 items-center rounded-xl py-3 text-sm font-medium transition ${compact ? "justify-center px-2" : "gap-3 px-4"} ${active ? "bg-gold text-navy" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
        <link.icon size={19} className="shrink-0" />
        {!compact && <span className="truncate">{link.label}</span>}
        {link.href === "/admin/inquiries" && unreadCount > 0 && <span className={compact ? "absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-navy" : "ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-bold text-navy"}>{compact ? <span className="sr-only">{unreadCount} unread</span> : unreadCount}</span>}
      </Link>;
    })}
  </nav>;

  return <>
    <header className="admin-header sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="admin-mobile-nav" aria-label={open ? "Close admin menu" : "Open admin menu"} className="rounded-lg p-2 lg:hidden"><FiMenu size={22} /></button>
        <span className="text-sm font-semibold text-navy">School administration</span>
      </div>
      <Link href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-navy">View website <FiExternalLink /></Link>
    </header>
    <aside className={`admin-sidebar fixed inset-y-0 left-0 z-50 hidden flex-col bg-navy p-4 text-white lg:flex ${collapsed ? "items-center" : ""}`}>
      <div className={`mb-8 mt-1 flex w-full items-center ${collapsed ? "flex-col gap-5" : "justify-between gap-2"}`}>
        <Link href="/admin/dashboard" aria-label={collapsed ? `${name} administration` : undefined} title={collapsed ? `${name} administration` : undefined} className={`flex min-w-0 items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <SchoolLogo name={name} url={logo} size={40} />
          {!collapsed && <span className="font-heading font-bold">{name}<span className="block text-xs font-normal text-slate-400">{access.role === "SUPER_ADMIN" ? "Super Admin" : "School Admin"}</span></span>}
        </Link>
        <button type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white">
          {collapsed ? <FiChevronsRight size={19} /> : <FiChevronsLeft size={19} />}
        </button>
      </div>
      <div className="min-h-0 w-full flex-1 overflow-y-auto">{navigation(collapsed)}</div>
      <button onClick={() => signOut({ callbackUrl: "/" })} aria-label={collapsed ? "Sign out" : undefined} title={collapsed ? "Sign out" : undefined} className={`mt-auto flex min-h-12 items-center rounded-xl py-3 text-sm text-slate-300 hover:bg-white/10 ${collapsed ? "w-full justify-center px-2" : "gap-3 px-4"}`}><FiLogOut size={19} /> {!collapsed && "Sign out"}</button>
    </aside>
    {open && <div id="admin-mobile-nav" className="fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/10 bg-navy p-5 text-white shadow-xl lg:hidden">
      <div className="mb-3 flex items-center justify-between"><span className="font-bold">Workspace</span><button onClick={() => setOpen(false)} aria-label="Close admin menu" className="p-3"><FiX /></button></div>
      {navigation(false)}
      <button onClick={() => signOut({ callbackUrl: "/" })} className="mt-3 flex items-center gap-3 px-4 py-3 text-sm"><FiLogOut /> Sign out</button>
    </div>}
  </>;
}
