import { NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

/**
 * Serves admin-uploaded media from `UPLOADS_DIR` (seeded images stay under
 * `/public/artists/...`; uploaded ones live here at `/media/...`). Resolves the
 * requested path against the uploads root and rejects anything that escapes it
 * (path traversal). Sends a long immutable cache header since filenames are
 * content-unique.
 */
export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const uploadsDir = process.env.UPLOADS_DIR;
  if (!uploadsDir) {
    return new NextResponse("Not configured", { status: 500 });
  }

  const { path: segments } = await context.params;
  const root = path.resolve(uploadsDir);
  const filePath = path.resolve(root, ...(segments ?? []));

  // Reject anything resolving outside the uploads root (path traversal).
  if (filePath !== root && !filePath.startsWith(root + path.sep)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      return new NextResponse("Not found", { status: 404 });
    }
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
  const data = await readFile(filePath);

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
