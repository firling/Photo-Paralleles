import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  formatCents,
  formatDateTime,
  parseShippingAddress,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  ORDER_STATUSES,
} from "@/lib/admin";
import { updateOrderStatusAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) notFound();

  const address = parseShippingAddress(order.shippingAddress);
  const addressLines = [
    address.line1,
    address.line2,
    [address.postalCode, address.city].filter(Boolean).join(" "),
    address.country,
  ].filter((v): v is string => Boolean(v && v.trim()));

  return (
    <>
      <div className="adm-page-head">
        <div>
          <p style={{ marginBottom: 4 }}>
            <Link href="/admin/commandes" style={{ color: "var(--accent)" }}>
              ← Commandes
            </Link>
          </p>
          <h1>Commande {order.reference}</h1>
          <p>Passée le {formatDateTime(order.createdAt)}</p>
        </div>
        <span
          className={`adm-badge adm-badge--${ORDER_STATUS_TONE[order.status]}`}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="adm-cols">
        <div className="adm-card">
          <h2 className="adm-kpi__label" style={{ marginBottom: 12 }}>
            Client
          </h2>
          <dl className="adm-dl">
            <dt>Nom</dt>
            <dd>{order.customerName}</dd>
            <dt>Email</dt>
            <dd>{order.customerEmail}</dd>
          </dl>
        </div>

        <div className="adm-card">
          <h2 className="adm-kpi__label" style={{ marginBottom: 12 }}>
            Adresse de livraison
          </h2>
          {addressLines.length > 0 ? (
            <address style={{ fontStyle: "normal", lineHeight: 1.6 }}>
              {addressLines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </address>
          ) : (
            <p style={{ color: "var(--muted)" }}>Non renseignée.</p>
          )}
        </div>
      </div>

      <section className="adm-section">
        <h2>Articles</h2>
        <div className="adm-tablewrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Réf.</th>
                <th className="adm-num">P.U.</th>
                <th className="adm-num">Qté</th>
                <th className="adm-num">Sous-total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td className="adm-mono">{item.bookSlug}</td>
                  <td className="adm-num">{formatCents(item.unitPriceCents)}</td>
                  <td className="adm-num">{item.quantity}</td>
                  <td className="adm-num">
                    {formatCents(item.unitPriceCents * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="adm-num">
                  Sous-total
                </td>
                <td className="adm-num">{formatCents(order.subtotalCents)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="adm-num">
                  Livraison
                </td>
                <td className="adm-num">{formatCents(order.shippingCents)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="adm-num">
                  <strong>Total</strong>
                </td>
                <td className="adm-num">
                  <strong>{formatCents(order.totalCents)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className="adm-section">
        <h2>Statut</h2>
        <div className="adm-card" style={{ maxWidth: 460 }}>
          <form action={updateOrderStatusAction} className="adm-actions">
            <input type="hidden" name="orderId" value={order.id} />
            <div className="adm-field" style={{ flex: 1 }}>
              <label htmlFor="status">Mettre à jour le statut</label>
              <select id="status" name="status" defaultValue={order.status}>
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {ORDER_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="adm-btn">
              Enregistrer
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
