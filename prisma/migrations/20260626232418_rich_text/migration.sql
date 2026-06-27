-- Migrate long-text catalog fields from `text[]` to `jsonb` (Tiptap documents).
-- The existing string arrays are cast in place to JSON arrays via `to_jsonb`
-- (valid JSON, keeps the NOT NULL constraint). The seed then overwrites these
-- columns with proper ProseMirror documents `{ type: "doc", content: [...] }`.

ALTER TABLE "Artist"
  ALTER COLUMN "bio" TYPE JSONB USING to_jsonb("bio");

ALTER TABLE "Book"
  ALTER COLUMN "description" TYPE JSONB USING to_jsonb("description");
