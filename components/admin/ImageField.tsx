"use client";

import { useRef, useState } from "react";

/**
 * Image picker for the catalog forms. Uploads the chosen file to the
 * session-guarded `/admin/api/upload` endpoint, shows a preview, and keeps the
 * returned `/media/...` URL in a hidden input so the surrounding Server-Action
 * form persists it. No external upload library.
 */

interface ImageFieldProps {
  name: string;
  label: string;
  initialUrl?: string;
  hint?: string;
}

interface UploadResponse {
  url: string;
  width: number;
  height: number;
}

export default function ImageField({
  name,
  label,
  initialUrl = "",
  hint,
}: ImageFieldProps) {
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
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
      setUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="adm-field">
      <label>{label}</label>
      <div className="adm-imagefield">
        <div className="adm-imagefield__preview">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Aperçu" />
          ) : (
            <span className="adm-imagefield__empty">Aucune image</span>
          )}
        </div>
        <div className="adm-imagefield__controls">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handlePick}
            disabled={uploading}
          />
          <div className="adm-imagefield__row">
            {uploading ? (
              <span className="adm-field__hint">Envoi en cours…</span>
            ) : null}
            {url ? (
              <button
                type="button"
                className="adm-btn adm-btn--ghost adm-btn--sm"
                onClick={() => setUrl("")}
                disabled={uploading}
              >
                Retirer
              </button>
            ) : null}
          </div>
          {url ? <code className="adm-imagefield__url">{url}</code> : null}
          {error ? (
            <span className="adm-alert adm-alert--error">{error}</span>
          ) : null}
        </div>
      </div>
      {hint ? <span className="adm-field__hint">{hint}</span> : null}
      <input type="hidden" name={name} value={url} />
    </div>
  );
}
