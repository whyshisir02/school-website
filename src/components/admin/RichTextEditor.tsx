"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import { useState } from "react";
import {
  FiBold, FiItalic, FiUnderline, FiList, FiLink, FiImage, FiLoader,
  FiRotateCcw, FiRotateCw,
} from "react-icons/fi";

/**
 * Small notice editor. Output is plain HTML written into a hidden field named
 * `content`, so the existing server action + sanitizeNoticeHtml() pipeline is
 * untouched — this only replaces the raw <textarea> the clerk used to hand-type
 * HTML into.
 *
 * The toolbar is deliberately tiny (bold / italic / underline / lists /
 * headings / link / image / undo). Anything richer is a maintenance burden a
 * one-operator village school won't use, and every tag it can emit is already
 * inside the sanitize allowlist in lib/sanitize.ts.
 */

type Props = {
  name: string;
  initialHTML: string;
  /** Reuses the notice image upload route; returns the hosted URL. */
  uploadUrl: string;
};

export default function RichTextEditor({ name, initialHTML, uploadUrl }: Props) {
  const [html, setHtml] = useState(initialHTML);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const editor = useEditor({
    // Next.js SSR: without this, hydration mismatches on the contentEditable.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // codeBlock/code emit <pre>/<code>, which aren't in the sanitize
        // allowlist and make no sense in a school notice — drop them so the
        // editor can't produce content the server would silently strip.
        codeBlock: false,
        code: false,
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({
        HTMLAttributes: {
          style: "max-width:100%;height:auto;border-radius:8px;margin:8px 0;",
        },
      }),
    ],
    content: initialHTML || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[220px] rounded-b-lg border border-t-0 border-slate-200 px-4 py-3 text-sm outline-none focus:border-gold",
      },
    },
    onUpdate: ({ editor }) => {
      // Treat a visually-empty doc as truly empty so `required` validation and
      // the sanitizer agree — TipTap otherwise emits "<p></p>".
      setHtml(editor.getText().trim() ? editor.getHTML() : "");
    },
  });

  async function onPickImage(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(uploadUrl, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      editor?.chain().focus().setImage({ src: data.url, alt: "Notice image" }).run();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function addLink() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div>
      {/* The value the server action reads. Kept in sync with the editor. */}
      <input type="hidden" name={name} value={html} />

      {editor && (
        <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="Bold">
            <FiBold size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="Italic">
            <FiItalic size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} label="Underline">
            <FiUnderline size={15} />
          </ToolbarButton>

          <Divider />

          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} label="Heading">
            <span className="text-sm font-bold">H2</span>
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} label="Subheading">
            <span className="text-xs font-bold">H3</span>
          </ToolbarButton>

          <Divider />

          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="Bullet list">
            <FiList size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="Numbered list">
            <span className="text-xs font-bold">1.</span>
          </ToolbarButton>

          <Divider />

          <ToolbarButton onClick={addLink} active={editor.isActive("link")} label="Add link">
            <FiLink size={15} />
          </ToolbarButton>
          <label className="flex cursor-pointer items-center rounded p-1.5 text-slate-600 hover:bg-slate-200" title="Insert image">
            {uploading ? <FiLoader className="animate-spin" size={15} /> : <FiImage size={15} />}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPickImage(f);
                e.target.value = "";
              }}
            />
          </label>

          <Divider />

          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} label="Undo">
            <FiRotateCcw size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} label="Redo">
            <FiRotateCw size={15} />
          </ToolbarButton>
        </div>
      )}

      <EditorContent editor={editor} />

      {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
    </div>
  );
}

function ToolbarButton({
  onClick, active, disabled, label, children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-8 min-w-8 items-center justify-center rounded px-1.5 transition disabled:opacity-30 ${
        active ? "bg-navy text-white" : "text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-slate-300" aria-hidden="true" />;
}
