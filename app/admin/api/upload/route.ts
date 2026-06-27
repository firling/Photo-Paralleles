import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getSession } from "@/lib/session";

/**
 * Image upload endpoint for the back-office. Session-guarded (401 without a
 * valid session). Accepts a single multipart image, normalizes it with sharp
 * (EXIF auto-rotate, metadata stripped, capped at 2000px wide, WebP q80) and
 * writes it to `UPLOADS_DIR` under a random collision-free name. Returns the
 * public `/media/<file>` URL plus the encoded dimensions.
 */
export const runtime = "nodejs";

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_WIDTH = 2000;

export async function POST(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const uploadsDir = process.env.UPLOADS_DIR;
  if (!uploadsDir) {
    return NextResponse.json(
      { error: "UPLOADS_DIR n'est pas configuré." },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Aucun fichier fourni." },
      { status: 400 },
    );
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Le fichier doit être une image." },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image trop volumineuse (15 Mo maximum)." },
      { status: 413 },
    );
  }

  const input = Buffer.from(await file.arrayBuffer());

  let data: Buffer;
  let width: number | undefined;
  let height: number | undefined;
  try {
    const result = await sharp(input, { failOn: "none" })
      .rotate() // auto-orient from EXIF, then drop the orientation tag
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true });
    data = result.data;
    width = result.info.width;
    height = result.info.height;
  } catch {
    return NextResponse.json(
      { error: "Image illisible ou corrompue." },
      { status: 422 },
    );
  }

  const filename = `${randomBytes(16).toString("hex")}.webp`;
  try {
    await writeFile(path.join(path.resolve(uploadsDir), filename), data);
  } catch {
    return NextResponse.json(
      { error: "Échec de l'enregistrement du fichier." },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: `/media/${filename}`, width, height });
}
