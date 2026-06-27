/**
 * Rich text (Tiptap / ProseMirror) helpers shared by the admin editor, the seed
 * and the public renderer. Long-text catalog fields (`Artist.bio`,
 * `Book.description`) are stored as a Tiptap JSON document (ProseMirror doc) in
 * a Prisma `Json` column.
 *
 * The same extension set must be used everywhere the document is interpreted
 * (editor, HTML generation) so the schema matches. StarterKit covers the block
 * nodes + basic marks; Link adds the link mark (StarterKit v2 does not include
 * it).
 */
import { generateHTML } from "@tiptap/html";
import type { Extensions, JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

export type { JSONContent };

/** Shared Tiptap extensions (must match between editor and renderer). */
export const richTextExtensions: Extensions = [
  StarterKit.configure({
    // Headings limited to the two levels the toolbar exposes.
    heading: { levels: [2, 3] },
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    HTMLAttributes: {
      rel: "noopener noreferrer nofollow",
      target: "_blank",
    },
  }),
];

/** An empty ProseMirror document (single empty paragraph). */
export const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

/**
 * Type guard: a value is a usable Tiptap document if it is an object whose
 * `type` is `"doc"`. Stored JSON comes back from Prisma as `unknown`-ish.
 */
export function isRichTextDoc(value: unknown): value is JSONContent {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (value as { type?: unknown }).type === "doc"
  );
}

/**
 * Convert a list of plain-text paragraphs into a Tiptap document. Used by the
 * seed to migrate the authored `string[]` content into rich text.
 */
export function paragraphsToDoc(paragraphs: string[]): JSONContent {
  const content = paragraphs
    .map((text) => text.trim())
    .filter((text) => text.length > 0)
    .map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    }));
  return { type: "doc", content: content.length > 0 ? content : [{ type: "paragraph" }] };
}

/**
 * Render a stored rich text document to an HTML string for the public site.
 * Returns an empty string for missing/invalid documents so callers can render
 * nothing gracefully.
 */
export function renderRichText(value: unknown): string {
  if (!isRichTextDoc(value)) return "";
  try {
    return generateHTML(value, richTextExtensions);
  } catch {
    return "";
  }
}
