"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPrice, type Currency } from "@/lib/content";

/**
 * Cart page body (client — the cart lives client-side). Shipping is the flat
 * settings rate passed down from the server page. Subtotal/total are derived
 * from the live cart. Renders an empty state until items exist.
 */
export default function CartView({
  shippingFlatCents,
  currency,
}: {
  shippingFlatCents: number;
  currency: Currency;
}) {
  const { items, ready, subtotalCents, count, setQuantity, removeItem } =
    useCart();

  const money = (cents: number) => formatPrice(cents / 100, currency);
  const hasItems = items.length > 0;
  const totalCents = subtotalCents + (hasItems ? shippingFlatCents : 0);

  return (
    <>
      <div className="wrap page-head">
        <p className="label eyebrow label--accent">Votre sélection</p>
        <h1>Panier</h1>
      </div>

      <main className="wrap section" style={{ paddingTop: 0 }}>
        {!ready ? (
          <p style={{ color: "var(--muted)" }}>Chargement…</p>
        ) : !hasItems ? (
          <div className="box cart-empty">
            <p className="label">Panier vide</p>
            <h3 className="cart-empty__title">Votre panier est vide</h3>
            <p style={{ color: "var(--ink-soft)", maxWidth: "44ch" }}>
              Parcourez la collection « Le Souffle de l&apos;Image » et ajoutez
              les titres qui vous parlent.
            </p>
            <Link className="btn" href="/livres" style={{ marginTop: 18 }}>
              Découvrir la collection
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <ul className="cart-lines">
              {items.map((item) => (
                <li className="cart-line" key={item.slug}>
                  <Link
                    className="cart-line__cover"
                    href={`/livres/${item.slug}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.cover} alt={item.title} />
                  </Link>
                  <div className="cart-line__body">
                    <h3 className="cart-line__title">
                      <Link href={`/livres/${item.slug}`}>{item.title}</Link>
                    </h3>
                    <p className="cart-line__unit">
                      {money(item.priceCents)} l&apos;unité
                    </p>
                    <div className="cart-line__controls">
                      <div className="qty" aria-label="Quantité">
                        <button
                          type="button"
                          aria-label="Diminuer la quantité"
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            setQuantity(item.slug, item.quantity - 1)
                          }
                        >
                          –
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Augmenter la quantité"
                          disabled={item.quantity >= 99}
                          onClick={() =>
                            setQuantity(item.slug, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="cart-line__remove"
                        onClick={() => removeItem(item.slug)}
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                  <div className="cart-line__amount">
                    {money(item.priceCents * item.quantity)}
                  </div>
                </li>
              ))}
            </ul>

            <aside className="cart-summary box">
              <p className="label">Récapitulatif</p>
              <dl className="cart-totals">
                <div>
                  <dt>
                    Sous-total
                    <span className="cart-totals__hint">
                      {" "}
                      ({count} article{count > 1 ? "s" : ""})
                    </span>
                  </dt>
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
              <Link className="btn btn--block" href="/commande">
                Passer commande
              </Link>
              <Link
                className="cart-summary__back"
                href="/livres"
              >
                ← Continuer mes achats
              </Link>
              <p className="note" style={{ marginTop: 14 }}>
                Paiement en ligne bientôt disponible.
              </p>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
