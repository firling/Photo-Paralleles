"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import GalleryField from "@/components/admin/GalleryField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { slugify } from "@/lib/slug";
import type { ProjectFormState } from "./actions";

export interface ProjectFormInitial {
  title: string;
  slug: string;
  kind: string;
  year: string;
  location: string;
  lead: string;
  cover: string;
  gallery: string[];
  order: string;
  published: boolean;
  description: unknown;
}

export default function ProjectForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prev: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  initial: ProjectFormInitial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ProjectFormState, FormData>(
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
        <span className="adm-field__hint">/projets/{slug || "…"}</span>
      </div>

      <div className="adm-cols">
        <div className="adm-field">
          <label htmlFor="kind">Type</label>
          <input
            id="kind"
            name="kind"
            type="text"
            defaultValue={initial.kind}
            placeholder="Exposition, Édition, Workshop…"
            required
          />
        </div>
        <div className="adm-field">
          <label htmlFor="year">Année</label>
          <input id="year" name="year" type="text" defaultValue={initial.year} />
        </div>
      </div>

      <div className="adm-field">
        <label htmlFor="location">Lieu</label>
        <input
          id="location"
          name="location"
          type="text"
          defaultValue={initial.location}
          placeholder="Annecy, Festival d'Arles…"
        />
      </div>

      <div className="adm-field">
        <label htmlFor="lead">Accroche (texte simple)</label>
        <textarea id="lead" name="lead" rows={2} defaultValue={initial.lead} />
        <span className="adm-field__hint">
          Phrase d&apos;introduction affichée en tête de la fiche et sur les
          cartes.
        </span>
      </div>

      <RichTextEditor
        name="description"
        label="Description"
        initialContent={initial.description}
        hint="Texte enrichi (gras, italique, listes, liens…)."
      />

      <ImageField
        name="cover"
        label="Image de couverture"
        initialUrl={initial.cover}
        hint="Image principale (bannière + vignette)."
      />

      <GalleryField
        name="gallery"
        label="Galerie"
        initialImages={initial.gallery}
        hint="Plusieurs images possibles. Glissez l'ordre avec les flèches."
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
        <Link href="/admin/projets" className="adm-btn adm-btn--ghost">
          Annuler
        </Link>
      </div>
    </form>
  );
}
