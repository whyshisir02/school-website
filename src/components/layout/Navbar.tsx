"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMenu, FiX, FiPhone, FiMail } from "react-icons/fi";
import { SiFacebook } from "react-icons/si";
import { SCHOOL } from "@/lib/school";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/academics", label: "Academics" },
  { href: "/notices", label: "Notices", hasDot: true },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/notices/recent")
      .then((r) => (r.ok ? r.json() : { count: 0 }))
      .then((d) => setNewCount(d.count ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow print:hidden ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className={`container-page flex items-center justify-between transition-all ${scrolled ? "h-16" : "h-20"}`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy font-heading text-lg font-bold text-gold">
            EV
          </div>
          <div className="leading-tight">
            <div className="font-heading text-base font-bold text-navy sm:text-lg">
              Shree Eastern View
            </div>
            <div className="text-[11px] font-medium tracking-wide text-slate-500">
              ENGLISH SCHOOL · {SCHOOL.location.toUpperCase()}
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative flex items-center gap-1.5 pb-1 text-sm font-medium transition ${
                  active
                    ? "border-b-2 border-gold text-navy"
                    : "border-b-2 border-transparent text-slate-600 hover:text-navy"
                }`}
              >
                {l.label}
                {l.hasDot && newCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {newCount}
                  </span>
                )}
              </Link>
            );
          })}
          <Link href="/contact#admission" className="btn-primary !px-5 !py-2.5 text-sm">
            Admission Info
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="rounded-lg p-2 text-navy lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-white shadow-xl transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <span className="font-heading font-bold text-navy">Menu</span>
          <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-navy">
            <FiX size={22} />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium ${
                  active ? "bg-navy text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {l.label}
                {l.hasDot && newCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {newCount}
                  </span>
                )}
              </Link>
            );
          })}
          <Link href="/contact#admission" className="btn-primary mt-4 justify-center">
            Admission Info
          </Link>
        </nav>
        <div className="space-y-2 border-t p-5 text-xs text-slate-600">
          <p className="flex items-center gap-2"><FiPhone size={12} /> {SCHOOL.phone}</p>
          <p className="flex items-center gap-2"><FiMail size={12} /> {SCHOOL.email}</p>
          <a href={SCHOOL.facebook} className="flex items-center gap-2" target="_blank" rel="noopener noreferrer">
            <SiFacebook size={12} /> Facebook Page
          </a>
        </div>
      </aside>
    </header>
  );
}
