"use client";

import { useState, useTransition } from "react";
import { deleteNotice, toggleNoticePublish } from "@/app/admin/(panel)/notices/actions";
import { FiTrash2, FiEye, FiEyeOff, FiEdit2 } from "react-icons/fi";

type EditableNotice = {
  id: string;
  title: string;
  category: string;
  isPublished: boolean;
  content: string;
};

type Props = {
  notice: EditableNotice;
  onEdit?: (notice: EditableNotice) => void;
};

export default function NoticeRow({ notice, onEdit }: Props) {
  const [pending, startTransition] = useTransition();

  const btn =
    "shrink-0 rounded-lg p-2 disabled:opacity-50 transition";

  return (
    <li className="flex items-center justify-between gap-4 px-5 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{notice.title}</p>
        <p className="text-xs text-slate-400">
          {notice.category} · {notice.isPublished ? "Published" : "Draft"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {onEdit && (
          <button
            disabled={pending}
            onClick={() => onEdit(notice)}
            className={`${btn} text-slate-500 hover:bg-slate-100 hover:text-navy`}
            aria-label="Edit notice"
            title="Edit"
          >
            <FiEdit2 size={16} />
          </button>
        )}
        <button
          disabled={pending}
          onClick={() => startTransition(() => toggleNoticePublish(notice.id, !notice.isPublished))}
          className={`${btn} ${notice.isPublished ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
          aria-label={notice.isPublished ? "Unpublish notice" : "Publish notice"}
          title={notice.isPublished ? "Unpublish (save as draft)" : "Publish"}
        >
          {notice.isPublished ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
        <button
          disabled={pending}
          onClick={() => {
            if (confirm("Delete this notice?")) startTransition(() => deleteNotice(notice.id));
          }}
          className={`${btn} text-red-500 hover:bg-red-50`}
          aria-label="Delete notice"
          title="Delete"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </li>
  );
}
