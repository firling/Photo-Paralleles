"use client";

import { useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import {
  richTextExtensions,
  EMPTY_DOC,
  isRichTextDoc,
  type JSONContent,
} from "@/lib/richtext";

/**
 * Tiptap rich text editor for the catalog forms (artist bios, book
 * descriptions). Serializes `editor.getJSON()` into a hidden input so the
 * surrounding Server-Action form submits the ProseMirror document as JSON. The
 * same extension set is used by the public renderer (`lib/richtext.ts`).
 */

interface RichTextEditorProps {
  name: string;
  label: string;
  initialContent?: unknown;
  hint?: string;
}

function startDoc(content: unknown): JSONContent {
  return isRichTextDoc(content) ? content : EMPTY_DOC;
}

function ToolbarButton({
  label,
  title,
  isActive,
  onClick,
  disabled,
}: {
  label: string;
  title: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={isActive}
      className={`adm-rte__btn${isActive ? " is-active" : ""}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return <div className="adm-rte__toolbar" aria-hidden="true" />;
  }

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL du lien", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  };

  return (
    <div className="adm-rte__toolbar">
      <ToolbarButton
        label="B"
        title="Gras"
        isActive={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        label="I"
        title="Italique"
        isActive={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <span className="adm-rte__sep" />
      <ToolbarButton
        label="H2"
        title="Titre 2"
        isActive={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      />
      <ToolbarButton
        label="H3"
        title="Titre 3"
        isActive={editor.isActive("heading", { level: 3 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
      />
      <span className="adm-rte__sep" />
      <ToolbarButton
        label="• Liste"
        title="Liste à puces"
        isActive={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        label="1. Liste"
        title="Liste numérotée"
        isActive={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarButton
        label="❝"
        title="Citation"
        isActive={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <ToolbarButton
        label="Lien"
        title="Ajouter / éditer un lien"
        isActive={editor.isActive("link")}
        onClick={setLink}
      />
      <span className="adm-rte__sep" />
      <ToolbarButton
        label="↶"
        title="Annuler"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      />
      <ToolbarButton
        label="↷"
        title="Rétablir"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      />
    </div>
  );
}

export default function RichTextEditor({
  name,
  label,
  initialContent,
  hint,
}: RichTextEditorProps) {
  const initial = startDoc(initialContent);
  const [json, setJson] = useState<string>(() => JSON.stringify(initial));

  const editor = useEditor({
    extensions: richTextExtensions,
    content: initial,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "adm-rte__content" },
    },
    onUpdate: ({ editor }) => setJson(JSON.stringify(editor.getJSON())),
  });

  return (
    <div className="adm-field">
      <label>{label}</label>
      <div className="adm-rte">
        <Toolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      {hint ? <span className="adm-field__hint">{hint}</span> : null}
      <input type="hidden" name={name} value={json} />
    </div>
  );
}
