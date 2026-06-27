"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice, type Currency } from "@/lib/content";
import { createOrder, type CreateOrderInput } from "./actions";

/**
 * Checkout body (client). Collects the customer + shipping fields and shows a
 * server-priced recap of the live cart. Submitting calls the `createOrder`
 * server action with slugs + quantities only — the server re-prices everything.
 * On success the cart is cleared and we navigate to the confirmation page with
 * the reference.
 */
export default function CheckoutView({
  shippingFlatCents,
  currency,
}: {
  shippingFlatCents: number;
  currency: Currency;
}) {
  const router = useRouter();
  const { items, ready, subtotalCents, clear } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const money = (cents: number) => formatPrice(cents / 100, currency);
  const hasItems = items.length > 0;
  const totalCents = subtotalCents + (hasItems ? shippingFlatCents : 0);

  if (ready && !hasItems) {
    return (
      <>
        <div className="wrap page-head">
          <p className="label eyebrow label--accent">Commande</p>
          <h1>Finaliser la commande</h1>
        </div>
        <main className="wrap section" style={{ paddingTop: 0 }}>
          <div className="box cart-empty">
            <h3 className="cart-empty__title">Votre panier est vide</h3>
            <p style={{ color: "var(--ink-soft)" }}>
              Ajoutez des titres avant de passer commande.
            </p>
            <Link className="btn" href="/livres" style={{ marginTop: 18 }}>
              Découvrir la collection
            </Link>
          </div>
        </main>
      </>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const input: CreateOrderInput = {
      customerName: String(fd.get("customerName") ?? ""),
      customerEmail: String(fd.get("customerEmail") ?? ""),
      line1: String(fd.get("line1") ?? ""),
      line2: String(fd.get("line2") ?? ""),
      postalCode: String(fd.get("postalCode") ?? ""),
      city: String(fd.get("city") ?? ""),
      country: String(fd.get("country") ?? "France"),
      items: items.map((it) => ({ slug: it.slug, quantity: it.quantity })),
    };

    startTransition(async () => {
      const result = await createOrder(input);
      if (result.ok) {
        clear();
        router.push(
          `/commande/confirmation?ref=${encodeURIComponent(result.reference)}`,
        );
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <div className="wrap page-head">
        <p className="label eyebrow label--accent">Commande</p>
        <h1>Finaliser la commande</h1>
      </div>

      <main className="wrap section" style={{ paddingTop: 0 }}>
        <div className="checkout-layout">
          <form className="form checkout-form" onSubmit={onSubmit} noValidate>
            <h2 className="checkout-form__heading">Coordonnées</h2>
            <div className="field">
              <label htmlFor="customerName">Nom complet</label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                required
                autoComplete="name"
              />
            </div>
            <div className="field">
              <label htmlFor="customerEmail">Email</label>
              <input
                id="customerEmail"
                name="customerEmail"
                type="email"
                required
                autoComplete="email"
              />
            </div>

            <h2 className="checkout-form__heading">Adresse de livraison</h2>
            <div className="field">
              <label htmlFor="line1">Adresse</label>
              <input
                id="line1"
                name="line1"
                type="text"
                required
                autoComplete="address-line1"
              />
            </div>
            <div className="field">
              <label htmlFor="line2">
                Complément d&apos;adresse (optionnel)
              </label>
              <input
                id="line2"
                name="line2"
                type="text"
                autoComplete="address-line2"
              />
            </div>
            <div className="checkout-form__row">
              <div className="field">
                <label htmlFor="postalCode">Code postal</label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  required
                  autoComplete="postal-code"
                />
              </div>
              <div className="field">
                <label htmlFor="city">Ville</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  autoComplete="address-level2"
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="country">Pays</label>
              <input
                id="country"
                name="country"
                type="text"
                defaultValue="France"
                required
                autoComplete="country-name"
              />
            </div>

            {error ? (
              <p className="checkout-error" role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" className="btn btn--block" disabled={pending}>
              {pending ? "Enregistrement…" : "Valider la commande"}
            </button>
            <p className="note">
              Aucun paiement ne vous sera demandé maintenant. Le paiement en
              ligne sera bientôt disponible — nous vous recontactons.
            </p>
          </form>

          <aside className="checkout-recap box">
            <p className="label">Votre commande</p>
            <ul className="checkout-recap__items">
              {items.map((it) => (
                <li key={it.slug}>
                  <span className="checkout-recap__name">
                    {it.title}
                    <span className="checkout-recap__qty"> × {it.quantity}</span>
                  </span>
                  <span>{money(it.priceCents * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="cart-totals">
              <div>
                <dt>Sous-total</dt>
                <dd>{money(subtotalCents)}</dd>
              </div>
              <div>
                <dt>Livraison — forfait unique</dt>
                <dd>{money(shippingFlatCents)}</dd>
              </div>
              <div className="cart-totals__total">
                <dt>Total</dt>
                <dd>{money(totalCents)}</dd>
              </div>
            </dl>
            <Link className="cart-summary__back" href="/panier">
              ← Modifier le panier
            </Link>
          </aside>
        </div>
      </main>
    </>
  );
}
