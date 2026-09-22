"use client";

import { useRef, useState } from "react";
import { saveNotice } from "@/app/admin/(panel)/notices/actions";
import RichTextEditor from "@/components/admin/RichTextEditor";
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
        await saveNotice(fd);
        setSaved(true);
        if (!editing) formRef.current?.reset();
      }}
      className="mt-4 space-y-4 rounded-xl bg-white p-6 shadow-sm"
    >
      {editing && <input type="hidden" name="id" value={editing.id} />}

      <input
        name="title"
        required
        defaultValue={editing?.title ?? ""}
        key={editing ? `t-${editing.id}` : "t-new"}
        placeholder="Notice title"
        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-gold"
      />
      <select
        name="category"
        defaultValue={editing?.category ?? "GENERAL"}
        key={editing ? `c-${editing.id}` : "c-new"}
        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-gold"
      >
        {["GENERAL", "EXAM", "HOLIDAY", "EVENT"].map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Rich-text body. The key remounts the editor with fresh content when
          switching between "new" and editing an existing notice. */}
      <RichTextEditor
        key={editing ? `e-${editing.id}` : "e-new"}
        name="content"
        initialHTML={editing?.content ?? ""}
        uploadUrl="/api/admin/notices/upload"
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={editing?.isPublished ?? true}
          key={editing ? `p-${editing.id}` : "p-new"}
          className="accent-gold"
        />
        Publish immediately
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && !error && (
        <p className="text-sm font-medium text-green-600">
          {editing ? "Changes saved." : "Notice created."}
        </p>
      )}
      <button type="submit" className="btn-primary w-full justify-center !py-2.5 text-sm">
        <FiPlus /> {editing ? "Save Changes" : "Create Notice"}
      </button>
    </form>
  );
}
