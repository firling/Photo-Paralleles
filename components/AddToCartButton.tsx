"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { availabilityLabel, type Availability } from "@/lib/content";

/**
 * Compact "Ajouter" button used in the shop grid (`BookCard`). Only AVAILABLE
 * books can be added; otherwise the button is disabled and shows the state.
 * On add it briefly confirms ("Ajouté ✓") as lightweight feedback.
 */
export default function AddToCartButton({
  slug,
  title,
  priceCents,
  cover,
  availability,
}: {
  slug: string;
  title: string;
  priceCents: number;
  cover: string;
  availability: Availability;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (availability !== "AVAILABLE") {
    return (
      <button type="button" className="add" disabled aria-disabled="true">
        {availabilityLabel(availability)}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`add${added ? " is-added" : ""}`}
      onClick={() => {
        addItem({ slug, title, priceCents, cover });
        setAdded(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdded(false), 1400);
      }}
    >
      {added ? "Ajouté ✓" : "Ajouter"}
    </button>
  );
}
