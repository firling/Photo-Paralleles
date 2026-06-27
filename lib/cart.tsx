"use client";

/**
 * Client-side shopping cart (React context, multi-book).
 *
 * The cart is a pure client concern: it lives in React state, persists to
 * `localStorage`, and stores a display *snapshot* of each line (title, price,
 * cover). Authoritative prices/availability are always re-validated server-side
 * at checkout (`createOrder`) — the snapshot here is for display only.
 *
 * SSR-safe: the provider renders an empty cart on the server and during the
 * first client render, then hydrates from `localStorage` in an effect. This
 * avoids a hydration mismatch (the markup matches the empty-cart server output
 * until after mount).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const STORAGE_KEY = "pp.cart.v1";
const MIN_QTY = 1;
const MAX_QTY = 99;

export interface CartItem {
  slug: string;
  title: string;
  /** Display snapshot of the unit price in cents. Re-validated server-side. */
  priceCents: number;
  cover: string;
  quantity: number;
}

/** Minimal book shape needed to add a line to the cart. */
export interface AddableBook {
  slug: string;
  title: string;
  priceCents: number;
  cover: string;
}

interface CartContextValue {
  items: CartItem[];
  /** True once hydrated from localStorage (use to gate cart-dependent UI). */
  ready: boolean;
  count: number;
  subtotalCents: number;
  addItem: (book: AddableBook, qty?: number) => void;
  setQuantity: (slug: string, qty: number) => void;
  removeItem: (slug: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function clampQty(qty: number): number {
  if (!Number.isFinite(qty)) return MIN_QTY;
  return Math.min(MAX_QTY, Math.max(MIN_QTY, Math.round(qty)));
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.slug === "string" &&
    typeof v.title === "string" &&
    typeof v.priceCents === "number" &&
    typeof v.cover === "string" &&
    typeof v.quantity === "number"
  );
}

function readStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem).map((item) => ({
      ...item,
      quantity: clampQty(item.quantity),
    }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  // Guard against persisting the empty initial state over saved data before
  // the hydration read has run.
  const hydrated = useRef(false);

  // Hydrate once on mount.
  useEffect(() => {
    setItems(readStorage());
    hydrated.current = true;
    setReady(true);
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage may be unavailable (private mode, quota) — non-fatal.
    }
  }, [items]);

  const addItem = useCallback((book: AddableBook, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.slug === book.slug);
      if (existing) {
        return prev.map((it) =>
          it.slug === book.slug
            ? { ...it, quantity: clampQty(it.quantity + qty) }
            : it,
        );
      }
      return [
        ...prev,
        {
          slug: book.slug,
          title: book.title,
          priceCents: book.priceCents,
          cover: book.cover,
          quantity: clampQty(qty),
        },
      ];
    });
  }, []);

  const setQuantity = useCallback((slug: string, qty: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.slug === slug ? { ...it, quantity: clampQty(qty) } : it,
      ),
    );
  }, []);

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((it) => it.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((sum, it) => sum + it.quantity, 0),
    [items],
  );

  const subtotalCents = useMemo(
    () => items.reduce((sum, it) => sum + it.priceCents * it.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      count,
      subtotalCents,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [items, ready, count, subtotalCents, addItem, setQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
