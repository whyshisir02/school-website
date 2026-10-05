"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiSearch, FiEdit2, FiList } from "react-icons/fi";
import NoticeForm from "@/components/admin/NoticeForm";
import NoticeRow from "@/components/admin/NoticeRow";

type NoticeItem = {
  id: string;
  title: string;
  category: string;
  isPublished: boolean;
  content: string;
};

type Props = {
  initialEditing: NoticeItem | null;
  focusEditor: boolean;
  notices: NoticeItem[];
  q: string;
  page: number;
  totalPages: number;
  total: number;
  initialMobileView: "write" | "browse";
};

export default function NoticesManager({ initialEditing, focusEditor, notices, q, page, totalPages, total, initialMobileView }: Props) {
  const [editing, setEditing] = useState<NoticeItem | null>(initialEditing);
  const [mobileView, setMobileView] = useState<"write" | "browse">(initialMobileView);
  const formArea = useRef<HTMLDivElement>(null);
  useEffect(() => { setEditing(initialEditing); if (focusEditor) { setMobileView("write"); formArea.current?.scrollIntoView({ block: "start" }); formArea.current?.querySelector<HTMLInputElement>('input[name="title"]')?.focus(); } }, [initialEditing, focusEditor]);

  function editNotice(notice: NoticeItem) {
    setEditing(notice);
    setMobileView("write");
    requestAnimationFrame(() => {
      formArea.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      formArea.current?.querySelector<HTMLInputElement>('input[name="title"]')?.focus({ preventScroll: true });
    });
  }

  const pageHref = (p: number) =>
    `/admin/notices?page=${p}&view=browse${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-200 p-1 lg:hidden" aria-label="Notice workspace">
        <button type="button" onClick={() => setMobileView("write")} aria-pressed={mobileView === "write"} className={`flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold ${mobileView === "write" ? "bg-white text-navy shadow-sm" : "text-slate-600"}`}><FiEdit2 /> {editing ? "Edit notice" : "Write notice"}</button>
        <button type="button" onClick={() => setMobileView("browse")} aria-pressed={mobileView === "browse"} className={`flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold ${mobileView === "browse" ? "bg-white text-navy shadow-sm" : "text-slate-600"}`}><FiList /> Browse ({total})</button>
      </div>
      <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
      <div className={mobileView === "browse" ? "" : "hidden lg:block"}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Notices</h1>
          <span className="text-xs text-slate-400">{total} total</span>
        </div>

        {/* Search (GET → server-side filter) */}
        <form action="/admin/notices" method="get" className="mt-4 flex items-center gap-2">
          <input type="hidden" name="view" value="browse" />
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search notices by title…"
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-base outline-none focus:border-gold sm:text-sm"
            />
          </div>
          <button className="min-h-11 rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white">
            Search
          </button>
          {q && (
            <Link href="/admin/notices?view=browse" className="text-xs font-semibold text-slate-500 hover:text-navy">
              Clear
            </Link>
          )}
        </form>

        <ul className="mt-4 divide-y rounded-xl bg-white shadow-sm">
          {notices.map((n) => (
            <NoticeRow key={n.id} notice={n} onEdit={editNotice} />
          ))}
          {notices.length === 0 && (
            <li className="p-6 text-center text-sm text-slate-500">
              {q ? `No notices match “${q}”.` : "No notices yet."}
            </li>
          )}
        </ul>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Link
                key={i}
                href={pageHref(i + 1)}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium ${
                  page === i + 1 ? "bg-navy text-white" : "bg-white hover:bg-slate-100"
                }`}
              >
                {i + 1}
              </Link>
            ))}
          </div>
        )}
      </div>
      <div ref={formArea} className={`scroll-mt-24 ${mobileView === "write" ? "" : "hidden lg:block"}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{editing ? "Edit Notice" : "New Notice"}</h2>
          {editing && (
            <button
              onClick={() => setEditing(null)}
              className="text-xs font-semibold text-slate-500 hover:text-navy"
            >
              + New notice
            </button>
          )}
        </div>
        <NoticeForm key={editing?.id ?? "new"} editing={editing} />
      </div>
      </div>
    </div>
  );
}
