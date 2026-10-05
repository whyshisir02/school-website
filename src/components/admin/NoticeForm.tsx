"use client";

import { useRef, useState } from "react";
import { saveNotice } from "@/app/admin/(panel)/notices/actions";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { loading: () => <div className="h-64 animate-pulse rounded-xl bg-slate-100" /> });
import { FiPlus } from "react-icons/fi";

export type NoticeDraft = {
  id: string;
  title: string;
  category: string;
  isPublished: boolean;
  content: string;
};

export default function NoticeForm({ editing }: { editing: NoticeDraft | null }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        // The body lives in a hidden input, which native `required` can't
        // guard — so an empty notice would otherwise hit the server action's
        // silent `return` and look like it saved. Check here and tell the user.
        const title = String(fd.get("title") ?? "").trim();
        const content = String(fd.get("content") ?? "").trim();
        if (!title || !content) {
          setSaved(false);
          setError(!title ? "Please add a title." : "Please add some notice content.");
          return;
        }
        setError("");
        setPending(true);
        try {
          await saveNotice(fd);
          setSaved(true);
          if (!editing) { formRef.current?.reset(); setEditorKey((key) => key + 1); }
        } catch { setError("Could not save this notice. Please try again."); }
        finally { setPending(false); }
      }}
      className="mt-4 space-y-5 rounded-xl bg-white p-4 shadow-sm sm:p-6"
    >
      {editing && <input type="hidden" name="id" value={editing.id} />}

      <label className="block text-sm font-semibold text-navy">Notice title
        <input
          name="title"
          required
          defaultValue={editing?.title ?? ""}
          key={editing ? `t-${editing.id}` : "t-new"}
          placeholder="e.g. School holiday on Friday"
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base font-normal outline-none focus:border-gold"
        />
      </label>
      <label className="block text-sm font-semibold text-navy">Category
        <select
          name="category"
          defaultValue={editing?.category ?? "GENERAL"}
          key={editing ? `c-${editing.id}` : "c-new"}
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-normal outline-none focus:border-gold"
        >
          {["GENERAL", "EXAM", "HOLIDAY", "EVENT"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      {/* Rich-text body. The key remounts the editor with fresh content when
          switching between "new" and editing an existing notice. */}
      <div><p className="mb-2 text-sm font-semibold text-navy">Message</p><RichTextEditor
          key={`${editing?.id ?? "new"}-${editorKey}`}
          name="content"
          initialHTML={editing?.content ?? ""}
          uploadUrl="/api/admin/notices/upload"
        /></div>

      <label className="flex min-h-12 items-center gap-3 rounded-xl bg-slate-50 px-3 text-sm font-medium">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={editing?.isPublished ?? true}
          key={editing ? `p-${editing.id}` : "p-new"}
          className="h-5 w-5 accent-gold"
        />
        Publish immediately
      </label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {saved && !error && (
        <p role="status" className="text-sm font-medium text-green-600">
          {editing ? "Changes saved." : "Notice created."}
        </p>
      )}
      <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-100 bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <button type="submit" disabled={pending} className="btn-primary min-h-12 w-full justify-center !rounded-xl text-sm disabled:opacity-50">
          <FiPlus /> {pending ? "Saving..." : editing ? "Save changes" : "Create notice"}
        </button>
      </div>
    </form>
  );
}
