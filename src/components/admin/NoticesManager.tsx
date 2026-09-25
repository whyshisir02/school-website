"use client";

import { useState } from "react";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
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
  notices: NoticeItem[];
  q: string;
  page: number;
  totalPages: number;
  total: number;
};

export default function NoticesManager({ notices, q, page, totalPages, total }: Props) {
  const [editing, setEditing] = useState<NoticeItem | null>(null);

  const pageHref = (p: number) =>
    `/admin/notices?page=${p}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Manage Notices</h1>
          <span className="text-xs text-slate-400">{total} total</span>
        </div>

        {/* Search (GET → server-side filter) */}
        <form action="/admin/notices" method="get" className="mt-4 flex items-center gap-2">
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search notices by title…"
              className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-gold"
            />
          </div>
          <button className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white">
            Search
          </button>
          {q && (
            <Link href="/admin/notices" className="text-xs font-semibold text-slate-500 hover:text-navy">
              Clear
            </Link>
          )}
        </form>

        <ul className="mt-4 divide-y rounded-xl bg-white shadow-sm">
          {notices.map((n) => (
            <NoticeRow key={n.id} notice={n} onEdit={setEditing} />
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
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{editing ? "Edit Notice" : "New Notice"}</h2>
          {editing && (
            <button
              onClick={() => setEditing(null)}
              className="text-xs font-semibold text-slate-500 hover:text-navy"
            >
              + New instead
            </button>
          )}
        </div>
        <NoticeForm key={editing?.id ?? "new"} editing={editing} />
      </div>
    </div>
  );
}
