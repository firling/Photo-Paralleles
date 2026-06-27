import "server-only";
import { Resend } from "resend";
import type { Order, OrderItem } from "@prisma/client";
import { formatCents, parseShippingAddress } from "@/lib/admin";

/**
 * Transactional order emails (Resend, with a graceful dev fallback).
 *
 * In production a `RESEND_API_KEY` is set and two emails go out per order:
 * a confirmation to the customer and a notification to the association. In dev
 * (no key) nothing is sent — we `console.info` exactly what *would* be sent so
 * the checkout flow stays testable offline. An email failure must never break
 * order creation, so the whole thing is best-effort and swallows errors.
 */

const FROM = process.env.MAIL_FROM ?? "Photos Parallèles <commandes@photosparalleles.fr>";

interface OrderWithItems extends Order {
  items: OrderItem[];
}

interface MailMessage {
  to: string;
  subject: string;
  html: string;
}

function itemsTableHtml(items: OrderItem[]): string {
  const rows = items
    .map(
      (it) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #E2DCD3;">${escapeHtml(it.title)} <span style="color:#8A847C;">× ${it.quantity}</span></td>
          <td style="padding:8px 0;border-bottom:1px solid #E2DCD3;text-align:right;white-space:nowrap;">${formatCents(it.unitPriceCents * it.quantity)}</td>
        </tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>`;
}

function totalsHtml(order: OrderWithItems): string {
  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px;">
      <tr><td style="padding:4px 0;color:#4A4744;">Sous-total</td><td style="padding:4px 0;text-align:right;">${formatCents(order.subtotalCents)}</td></tr>
      <tr><td style="padding:4px 0;color:#4A4744;">Livraison — forfait unique</td><td style="padding:4px 0;text-align:right;">${formatCents(order.shippingCents)}</td></tr>
      <tr><td style="padding:8px 0 0;font-weight:600;">Total</td><td style="padding:8px 0 0;text-align:right;font-weight:600;">${formatCents(order.totalCents)}</td></tr>
    </table>`;
}

function shell(heading: string, body: string): string {
  return `
  <div style="background:#F7F4EF;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;color:#1A1A1A;">
    <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E2DCD3;padding:32px;">
      <h1 style="font-family:Georgia,serif;font-weight:400;font-size:22px;margin:0 0 8px;letter-spacing:-0.01em;">${escapeHtml(heading)}</h1>
      <div style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#4A4744;">
        ${body}
      </div>
      <p style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:12px;color:#8A847C;margin-top:28px;border-top:1px solid #E2DCD3;padding-top:16px;">
        Photos Parallèles — association photographique, près d'Annecy.
      </p>
    </div>
  </div>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildCustomerEmail(order: OrderWithItems): MailMessage {
  const body = `
    <p>Bonjour ${escapeHtml(order.customerName)},</p>
    <p>Merci pour votre commande. Elle est bien enregistrée sous la référence
       <strong>${escapeHtml(order.reference)}</strong>.</p>
    <p>Le paiement en ligne sera bientôt disponible — nous vous recontactons pour
       finaliser le règlement et l'expédition.</p>
    ${itemsTableHtml(order.items)}
    ${totalsHtml(order)}
  `;
  return {
    to: order.customerEmail,
    subject: `Votre commande ${order.reference} — Photos Parallèles`,
    html: shell("Commande enregistrée", body),
  };
}

function buildAdminEmail(order: OrderWithItems, to: string): MailMessage {
  const addr = parseShippingAddress(order.shippingAddress);
  const addressLines = [
    addr.line1,
    addr.line2,
    [addr.postalCode, addr.city].filter(Boolean).join(" "),
    addr.country,
  ]
    .filter((v): v is string => Boolean(v && v.trim()))
    .map(escapeHtml)
    .join("<br>");

  const body = `
    <p>Nouvelle commande <strong>${escapeHtml(order.reference)}</strong> (en attente).</p>
    <p><strong>Client :</strong> ${escapeHtml(order.customerName)}<br>
       <strong>Email :</strong> ${escapeHtml(order.customerEmail)}</p>
    <p><strong>Adresse :</strong><br>${addressLines || "—"}</p>
    ${itemsTableHtml(order.items)}
    ${totalsHtml(order)}
  `;
  return {
    to,
    subject: `Nouvelle commande ${order.reference}`,
    html: shell("Nouvelle commande", body),
  };
}

async function deliver(messages: MailMessage[]): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    for (const msg of messages) {
      console.info(
        `[mail] (dev fallback — RESEND_API_KEY absent) email NON envoyé\n  → to: ${msg.to}\n  → subject: ${msg.subject}`,
      );
    }
    return;
  }

  const resend = new Resend(apiKey);
  for (const msg of messages) {
    const { error } = await resend.emails.send({
      from: FROM,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
    });
    if (error) {
      console.error(`[mail] Resend a refusé l'envoi à ${msg.to}:`, error);
    }
  }
}

/**
 * Send the customer confirmation + the admin notification for an order.
 * Best-effort: never throws (logs and returns on failure).
 */
export async function sendOrderEmails(
  order: OrderWithItems,
  adminEmail: string | null,
): Promise<void> {
  try {
    const adminTo = adminEmail ?? process.env.MAIL_TO ?? null;
    const messages: MailMessage[] = [buildCustomerEmail(order)];
    if (adminTo) {
      messages.push(buildAdminEmail(order, adminTo));
    } else {
      console.info(
        "[mail] Aucun destinataire admin (contactEmail / MAIL_TO absents) — notification admin ignorée.",
      );
    }
    await deliver(messages);
  } catch (err) {
    console.error("[mail] Échec de l'envoi des emails de commande:", err);
  }
}
