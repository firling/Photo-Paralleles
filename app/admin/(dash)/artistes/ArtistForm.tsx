"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { slugify } from "@/lib/slug";
import type { ArtistFormState } from "./actions";

export interface ArtistFormInitial {
  name: string;
  slug: string;
  role: string;
  originCountry: string;
  baseCity: string;
  lead: string;
  portrait: string;
  oeuvre: string;
  order: string;
  published: boolean;
  bio: unknown;
}

export default function ArtistForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prev: ArtistFormState, formData: FormData) => Promise<ArtistFormState>;
  initial: ArtistFormInitial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ArtistFormState, FormData>(
    action,
    {},
  );
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [slugEdited, setSlugEdited] = useState(initial.slug.length > 0);

  return (
    <form action={formAction} className="adm-form" style={{ maxWidth: 760 }}>
      {state.error ? (
        <div className="adm-alert adm-alert--error" role="alert">
          {state.error}
        </div>
      ) : null}

      <div className="adm-field">
        <label htmlFor="name">Nom</label>
        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugEdited) setSlug(slugify(e.target.value));
          }}
          required
        />
      </div>

      <div className="adm-field">
        <label htmlFor="slug">Slug (URL)</label>
        <input
          id="slug"
          name="slug"
          type="text"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugEdited(true);
          }}
          required
        />
        <span className="adm-field__hint">/artistes/{slug || "…"}</span>
      </div>

      <div className="adm-field">
        <label htmlFor="role">Rôle</label>
        <input id="role" name="role" type="text" defaultValue={initial.role} required />
      </div>

      <div className="adm-cols">
        <div className="adm-field">
          <label htmlFor="originCountry">Origine</label>
          <input
            id="originCountry"
            name="originCountry"
            type="text"
            defaultValue={initial.originCountry}
          />
        </div>
        <div className="adm-field">
          <label htmlFor="baseCity">Ville</label>
          <input
            id="baseCity"
            name="baseCity"
            type="text"
            defaultValue={initial.baseCity}
          />
        </div>
      </div>

      <div className="adm-field">
        <label htmlFor="lead">Accroche (texte simple)</label>
        <textarea id="lead" name="lead" rows={2} defaultValue={initial.lead} />
        <span className="adm-field__hint">
          Phrase d&apos;introduction affichée en tête de la fiche.
        </span>
      </div>

      <RichTextEditor
        name="bio"
        label="Biographie"
        initialContent={initial.bio}
        hint="Texte enrichi (gras, italique, listes, liens…)."
      />

      <ImageField
        name="portrait"
        label="Portrait"
        initialUrl={initial.portrait}
        hint="Image envoyée et optimisée (WebP)."
      />

      <ImageField
        name="oeuvre"
        label="Œuvre"
        initialUrl={initial.oeuvre}
        hint="Image illustrant le travail de l'artiste."
      />

      <div className="adm-field">
        <label htmlFor="order">Ordre</label>
        <input
          id="order"
          name="order"
          type="number"
          step="1"
          defaultValue={initial.order}
          style={{ maxWidth: 160 }}
        />
      </div>

      <div className="adm-field adm-field--inline">
        <input
          id="published"
          name="published"
          type="checkbox"
          defaultChecked={initial.published}
        />
        <label htmlFor="published">Publié (visible sur le site)</label>
      </div>

      <div className="adm-actions">
        <button type="submit" className="adm-btn adm-btn--accent" disabled={pending}>
          {pending ? "Enregistrement…" : submitLabel}
        </button>
        <Link href="/admin/artistes" className="adm-btn adm-btn--ghost">
          Annuler
        </Link>
      </div>
    </form>
  );
}
