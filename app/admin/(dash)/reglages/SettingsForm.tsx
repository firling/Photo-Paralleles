"use client";

import { useActionState } from "react";
import { saveSettingsAction, type SettingsState } from "./actions";

export interface SettingsInitial {
  shippingFlatEuros: string;
  boxsetPriceEuros: string;
  currency: string;
  contactEmail: string;
  instagramUrl: string;
  showBoxset: boolean;
}

export default function SettingsForm({
  initial,
}: {
  initial: SettingsInitial;
}) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    saveSettingsAction,
    {},
  );

  return (
    <form action={formAction} className="adm-form">
      {state.ok ? (
        <div className="adm-alert adm-alert--ok" role="status">
          Réglages enregistrés.
        </div>
      ) : null}
      {state.error ? (
        <div className="adm-alert adm-alert--error" role="alert">
          {state.error}
        </div>
      ) : null}

      <div className="adm-field">
        <label htmlFor="shippingFlatEuros">Frais de port (forfait)</label>
        <div className="adm-input-affix">
          <input
            id="shippingFlatEuros"
            name="shippingFlatEuros"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initial.shippingFlatEuros}
          />
          <span>€</span>
        </div>
        <span className="adm-field__hint">
          Forfait unique appliqué à chaque commande.
        </span>
      </div>

      <div className="adm-field">
        <label htmlFor="currency">Devise (affichage)</label>
        <input
          id="currency"
          name="currency"
          type="text"
          defaultValue={initial.currency}
          maxLength={3}
          style={{ maxWidth: 120 }}
        />
      </div>

      <div className="adm-field">
        <label htmlFor="contactEmail">Email de contact</label>
        <input
          id="contactEmail"
          name="contactEmail"
          type="email"
          defaultValue={initial.contactEmail}
          placeholder="contact@photosparalleles.fr"
        />
      </div>

      <div className="adm-field">
        <label htmlFor="instagramUrl">URL Instagram</label>
        <input
          id="instagramUrl"
          name="instagramUrl"
          type="url"
          defaultValue={initial.instagramUrl}
          placeholder="https://instagram.com/photosparalleles"
        />
      </div>

      <div className="adm-field adm-field--inline">
        <input
          id="showBoxset"
          name="showBoxset"
          type="checkbox"
          defaultChecked={initial.showBoxset}
        />
        <label htmlFor="showBoxset">
          Afficher le coffret (boxset) sur le site
        </label>
      </div>

      <div className="adm-field">
        <label htmlFor="boxsetPriceEuros">Prix du coffret</label>
        <div className="adm-input-affix">
          <input
            id="boxsetPriceEuros"
            name="boxsetPriceEuros"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initial.boxsetPriceEuros}
          />
          <span>€</span>
        </div>
      </div>

      <div className="adm-actions">
        <button
          type="submit"
          className="adm-btn adm-btn--accent"
          disabled={pending}
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
