"use client";

import { useRef, useState } from "react";

/**
 * Multi-image picker. Uploads each chosen file to the session-guarded
 * `/admin/api/upload` endpoint and keeps the ordered list of returned
 * `/media/...` URLs in a hidden input (JSON array) so the surrounding
 * Server-Action form persists it. Reuses the same endpoint as `ImageField`.
 */

interface GalleryFieldProps {
  name: string;
  label: string;
  initialImages?: string[];
  hint?: string;
}

interface UploadResponse {
  url: string;
  width: number;
  height: number;
}

export default function GalleryField({
  name,
  label,
  initialImages = [],
  hint,
}: GalleryFieldProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/admin/api/upload", { method: "POST", body });
        if (!res.ok) {
          const payload = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(payload.error ?? "Échec de l'envoi de l'image.");
        }
        const data = (await res.json()) as UploadResponse;
        setImages((prev) => [...prev, data.url]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function move(index: number, delta: number) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="adm-field">
      <label>{label}</label>

      {images.length > 0 ? (
        <ul className="adm-gallery">
          {images.map((src, i) => (
            <li key={src} className="adm-gallery__item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Image ${i + 1}`} />
              <div className="adm-gallery__actions">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  title="Monter"
                  aria-label="Monter"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === images.length - 1}
                  title="Descendre"
                  aria-label="Descendre"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  title="Retirer"
                  aria-label="Retirer"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="adm-field__hint">Aucune image pour le moment.</p>
      )}

      <div className="adm-gallery__add">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePick}
          disabled={uploading}
        />
        {uploading ? (
          <span className="adm-field__hint">Envoi en cours…</span>
        ) : null}
      </div>

      {error ? <span className="adm-alert adm-alert--error">{error}</span> : null}
      {hint ? <span className="adm-field__hint">{hint}</span> : null}

      <input type="hidden" name={name} value={JSON.stringify(images)} />
    </div>
  );
}
