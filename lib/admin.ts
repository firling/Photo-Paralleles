import type { Availability, OrderStatus } from "@prisma/client";

/**
 * Shared back-office display helpers. Money is stored in cents everywhere; the
 * admin formats it in euros (FR locale). Order statuses get French labels and a
 * badge tone for the UI.
 */

const eurFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

/** Format an integer number of cents as a EUR string, e.g. 1299 -> "12,99 €". */
export function formatCents(cents: number): string {
  return eurFormatter.format(cents / 100);
}

/** Parse a euros string from a form (accepts "6", "6,50", "6.50") into cents. */
export function eurosToCents(value: string): number {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const euros = Number.parseFloat(normalized);
  if (!Number.isFinite(euros) || euros < 0) return 0;
  return Math.round(euros * 100);
}

/** Format cents as a plain euros number string for an input value, e.g. "6". */
export function centsToEurosInput(cents: number): string {
  const euros = cents / 100;
  return Number.isInteger(euros) ? String(euros) : euros.toFixed(2);
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(date: Date): string {
  return dateFormatter.format(date);
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  EN_ATTENTE: "En attente",
  PAYEE: "Payée",
  EXPEDIEE: "Expédiée",
  LIVREE: "Livrée",
  ANNULEE: "Annulée",
};

export const ORDER_STATUSES: OrderStatus[] = [
  "EN_ATTENTE",
  "PAYEE",
  "EXPEDIEE",
  "LIVREE",
  "ANNULEE",
];

/** Maps a status to an `adm-badge--*` modifier for tone. */
export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  EN_ATTENTE: "warn",
  PAYEE: "info",
  EXPEDIEE: "info",
  LIVREE: "ok",
  ANNULEE: "muted",
};

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  AVAILABLE: "Disponible",
  SOLD_OUT: "Épuisé",
  COMING_SOON: "Bientôt",
};

/** Maps an availability to an `adm-badge--*` modifier for tone. */
export const AVAILABILITY_TONE: Record<Availability, string> = {
  AVAILABLE: "ok",
  SOLD_OUT: "muted",
  COMING_SOON: "warn",
};

/** Shape of the JSON shipping address stored on Order. All fields optional. */
export interface ShippingAddress {
  line1?: string;
  line2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  [key: string]: unknown;
}

export function parseShippingAddress(value: unknown): ShippingAddress {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as ShippingAddress;
  }
  return {};
}
