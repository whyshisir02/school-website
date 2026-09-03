"use client";

import { useRef, useState } from "react";
import { saveNotice } from "@/app/admin/(panel)/notices/actions";
import { FiPlus, FiImage, FiX, FiLoader } from "react-icons/fi";

export type NoticeDraft = {
  id: string;
  title: string;
  category: string;
  isPublished: boolean;
  content: string;
};

export default function NoticeForm({ editing }: { editing: NoticeDraft | null }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [content, setContent] = useState(editing?.content ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function uploadImage(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/notices/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setContent(
        (c) => c + `\n<img src="${data.url}" alt="notice image" style="max-width:100%;border-radius:8px;margin:8px 0;" />\n`
      );
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await saveNotice(fd);
        formRef.current?.reset();
        setContent("");
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
      <textarea
        name="content"
        required
        rows={6}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Notice content…"
        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-gold"
      />

      {/* Image upload */}
      <div className="flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-medium text-slate-500 hover:border-gold hover:text-navy">
          {uploading ? <FiLoader className="animate-spin" size={14} /> : <FiImage size={14} />}
          {uploading ? "Uploading…" : "Add image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadImage(f);
              e.target.value = "";
            }}
          />
        </label>
        {content.includes("<img") && (
          <button
            type="button"
            onClick={() => setContent((c) => c.replace(/<img[^>]*>\n?/g, ""))}
            className="flex items-center gap-1 text-xs text-red-500 hover:underline"
          >
            <FiX size={12} /> Remove images
          </button>
        )}
      </div>
      {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}

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
      <button type="submit" className="btn-primary w-full justify-center !py-2.5 text-sm">
        <FiPlus /> {editing ? "Save Changes" : "Create Notice"}
      </button>
    </form>
  );
}
