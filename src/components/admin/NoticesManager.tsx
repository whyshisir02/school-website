"use client";

import { useState } from "react";
import NoticeForm, { type NoticeDraft } from "@/components/admin/NoticeForm";
import NoticeRow from "@/components/admin/NoticeRow";

type NoticeItem = {
  id: string;
  title: string;
  category: string;
  isPublished: boolean;
  content: string;
};

export default function NoticesManager({ notices }: { notices: NoticeItem[] }) {
  const [editing, setEditing] = useState<NoticeItem | null>(null);

  return (
    <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
      <div>
        <h1 className="text-2xl font-bold">Manage Notices</h1>
        <ul className="mt-4 divide-y rounded-xl bg-white shadow-sm">
          {notices.map((n) => (
            <NoticeRow
              key={n.id}
              notice={n}
              onEdit={setEditing}
            />
          ))}
          {notices.length === 0 && (
            <li className="p-6 text-center text-sm text-slate-500">No notices yet.</li>
          )}
        </ul>
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
        <NoticeForm key={editing?.id ?? "new"} editing={editing} />      </div>
    </div>
  );
}
