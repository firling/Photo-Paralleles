"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";

/**
 * Book-detail purchase panel: quantity stepper + add-to-cart, replacing the
 * former inert affordance. Only AVAILABLE books can be added; for SOLD_OUT /
 * COMING_SOON the controls are disabled. Adds `qty` copies and confirms.
 */
export default function BookBuyPanel({
  slug,
  title,
  priceCents,
  cover,
  isAvailable,
}: {
  slug: string;
  title: string;
  priceCents: number;
  cover: string;
  isAvailable: boolean;
}) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const clamp = (n: number) => Math.min(99, Math.max(1, n));

  return (
    <div className="product__buy">
      <div className="qty" aria-label="Quantité">
        <button
          type="button"
          aria-label="Diminuer la quantité"
          disabled={!isAvailable || qty <= 1}
          onClick={() => setQty((q) => clamp(q - 1))}
        >
          –
        </button>
        <span>{qty}</span>
        <button
          type="button"
          aria-label="Augmenter la quantité"
          disabled={!isAvailable || qty >= 99}
          onClick={() => setQty((q) => clamp(q + 1))}
        >
          +
        </button>
      </div>
      <button
        type="button"
        className={`btn${added ? " is-added" : ""}`}
        style={{ flex: 1 }}
        disabled={!isAvailable}
        onClick={() => {
          addItem({ slug, title, priceCents, cover }, qty);
          setAdded(true);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setAdded(false), 1400);
        }}
      >
        {!isAvailable ? "Indisponible" : added ? "Ajouté au panier ✓" : "Ajouter au panier"}
      </button>
    </div>
  );
}
