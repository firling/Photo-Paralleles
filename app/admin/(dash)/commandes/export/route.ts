import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import {
  formatCents,
  formatDateTime,
  parseShippingAddress,
  ORDER_STATUS_LABELS,
} from "@/lib/admin";

/**
 * CSV export of all orders + shipping addresses (for mailing). Session-guarded:
 * returns 401 when there is no valid admin session. Streamed as a download.
 */

function csvCell(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value);
  // Quote always; double internal quotes. Prefix risky leading chars to defeat
  // spreadsheet formula injection.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

const HEADERS = [
  "Référence",
  "Date",
  "Statut",
  "Client",
  "Email",
  "Adresse 1",
  "Adresse 2",
  "Code postal",
  "Ville",
  "Pays",
  "Sous-total",
  "Livraison",
  "Total",
];

export async function GET(): Promise<Response> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows = orders.map((order) => {
    const a = parseShippingAddress(order.shippingAddress);
    return [
      order.reference,
      formatDateTime(order.createdAt),
      ORDER_STATUS_LABELS[order.status],
      order.customerName,
      order.customerEmail,
      a.line1 ?? "",
      a.line2 ?? "",
      a.postalCode ?? "",
      a.city ?? "",
      a.country ?? "",
      formatCents(order.subtotalCents),
      formatCents(order.shippingCents),
      formatCents(order.totalCents),
    ]
      .map(csvCell)
      .join(",");
  });

  // BOM so Excel reads UTF-8 (accents) correctly.
  const csv = "﻿" + [HEADERS.map(csvCell).join(","), ...rows].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="commandes-${stamp}.csv"`,
      "cache-control": "no-store",
    },
  });
}
