"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { slugify } from "@/lib/slug";
import type { Availability } from "@/lib/content";
import { availabilityLabel } from "@/lib/content";
import type { BookFormState } from "./actions";

export interface BookFormInitial {
  title: string;
  slug: string;
  artistId: string;
  priceEuros: string;
  currency: string;
  availability: Availability;
  cover: string;
  order: string;
  published: boolean;
  format: string;
  pages: string;
  binding: string;
  paper: string;
  printing: string;
  description: unknown;
}

const AVAILABILITIES: Availability[] = ["AVAILABLE", "SOLD_OUT", "COMING_SOON"];

export default function BookForm({
  action,
  artists,
  initial,
  submitLabel,
}: {
  action: (prev: BookFormState, formData: FormData) => Promise<BookFormState>;
  artists: { id: string; name: string }[];
  initial: BookFormInitial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<BookFormState, FormData>(
    action,
    {},
  );
  const [title, setTitle] = useState(initial.title);
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
        <label htmlFor="title">Titre</label>
        <input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
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
        <span className="adm-field__hint">/livres/{slug || "…"}</span>
      </div>

      <div className="adm-field">
        <label htmlFor="artistId">Artiste</label>
        <select
          id="artistId"
          name="artistId"
          defaultValue={initial.artistId}
          required
        >
          <option value="">— Sélectionner —</option>
          {artists.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <span className="adm-field__hint">
          Relation 1–1 : seuls les artistes sans livre (et l&apos;artiste actuel)
          apparaissent.
        </span>
      </div>

      <div className="adm-cols">
        <div className="adm-field">
          <label htmlFor="priceEuros">Prix</label>
          <div className="adm-input-affix">
            <input
              id="priceEuros"
              name="priceEuros"
              type="number"
              min="0"
              step="0.01"
              defaultValue={initial.priceEuros}
            />
            <span>€</span>
          </div>
        </div>
        <div className="adm-field">
          <label htmlFor="availability">Disponibilité</label>
          <select
            id="availability"
            name="availability"
            defaultValue={initial.availability}
          >
            {AVAILABILITIES.map((a) => (
              <option key={a} value={a}>
                {availabilityLabel(a)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="adm-cols">
        <div className="adm-field">
          <label htmlFor="currency">Devise</label>
          <input
            id="currency"
            name="currency"
            type="text"
            maxLength={3}
            defaultValue={initial.currency}
          />
        </div>
        <div className="adm-field">
          <label htmlFor="order">Ordre</label>
          <input
            id="order"
            name="order"
            type="number"
            step="1"
            defaultValue={initial.order}
          />
        </div>
      </div>

      <ImageField
        name="cover"
        label="Couverture"
        initialUrl={initial.cover}
        hint="Image envoyée et optimisée (WebP)."
      />

      <fieldset className="adm-fieldset">
        <legend>Caractéristiques</legend>
        <div className="adm-cols">
          <div className="adm-field">
            <label htmlFor="format">Format</label>
            <input id="format" name="format" type="text" defaultValue={initial.format} />
          </div>
          <div className="adm-field">
            <label htmlFor="pages">Pages</label>
            <input id="pages" name="pages" type="text" defaultValue={initial.pages} />
          </div>
        </div>
        <div className="adm-cols">
          <div className="adm-field">
            <label htmlFor="binding">Reliure</label>
            <input id="binding" name="binding" type="text" defaultValue={initial.binding} />
          </div>
          <div className="adm-field">
            <label htmlFor="paper">Papier</label>
            <input id="paper" name="paper" type="text" defaultValue={initial.paper} />
          </div>
        </div>
        <div className="adm-field">
          <label htmlFor="printing">Impression</label>
          <input id="printing" name="printing" type="text" defaultValue={initial.printing} />
        </div>
      </fieldset>

      <RichTextEditor
        name="description"
        label="Description"
        initialContent={initial.description}
        hint="Texte enrichi (gras, italique, listes, liens…)."
      />

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
        <Link href="/admin/livres" className="adm-btn adm-btn--ghost">
          Annuler
        </Link>
      </div>
    </form>
  );
}
