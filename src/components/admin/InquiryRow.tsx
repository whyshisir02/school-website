"use client";

import { useTransition } from "react";
import { FiCheck, FiTrash2, FiRotateCcw } from "react-icons/fi";
import { markInquiryRead, deleteInquiry } from "@/app/admin/(panel)/inquiries/actions";

type Inquiry = {
  id: string;
  name: string;
  phone: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

export default function InquiryRow({ inquiry }: { inquiry: Inquiry }) {
  const [pending, startTransition] = useTransition();
  const { id, name, phone, message, isRead, createdAt } = inquiry;

  return (
    <li className={`px-5 py-4 ${isRead ? "" : "bg-gold/5"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={`truncate text-sm font-semibold ${isRead ? "text-slate-700" : "text-navy"}`}>
            {name}
            {!isRead && (
              <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                New
              </span>
            )}
          </p>
          <a href={`tel:${phone}`} className="text-xs text-gold-dark hover:underline">
            {phone}
          </a>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{message}</p>
          <p className="mt-2 text-xs text-slate-400">
            {new Date(createdAt).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            disabled={pending}
            onClick={() => startTransition(() => markInquiryRead(id, !isRead))}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-navy disabled:opacity-50"
            aria-label={isRead ? "Mark as unread" : "Mark as read"}
            title={isRead ? "Mark unread" : "Mark read"}
          >
            {isRead ? <FiRotateCcw size={16} /> : <FiCheck size={16} />}
          </button>
          <button
            disabled={pending}
            onClick={() => startTransition(() => deleteInquiry(id))}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            aria-label="Delete inquiry"
            title="Delete"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
    </li>
  );
}
