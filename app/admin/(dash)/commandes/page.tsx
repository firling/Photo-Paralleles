import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  formatCents,
  formatDateTime,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
} from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Commandes</h1>
          <p>
            {orders.length} commande{orders.length > 1 ? "s" : ""} au total.
          </p>
        </div>
        {orders.length > 0 ? (
          <div className="adm-actions">
            <a className="adm-btn adm-btn--ghost adm-btn--sm" href="/admin/commandes/export">
              Exporter en CSV
            </a>
          </div>
        ) : null}
      </div>

      {orders.length === 0 ? (
        <div className="adm-empty">
          <h3>Aucune commande</h3>
          <p>
            Les commandes s&apos;afficheront ici une fois le paiement en ligne
            activé.
          </p>
        </div>
      ) : (
        <div className="adm-tablewrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Date</th>
                <th>Client</th>
                <th className="adm-num">Total</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="adm-mono">
                    <Link href={`/admin/commandes/${order.id}`}>
                      {order.reference}
                    </Link>
                  </td>
                  <td>{formatDateTime(order.createdAt)}</td>
                  <td>
                    {order.customerName}
                    <br />
                    <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                      {order.customerEmail}
                    </span>
                  </td>
                  <td className="adm-num">{formatCents(order.totalCents)}</td>
                  <td>
                    <span
                      className={`adm-badge adm-badge--${ORDER_STATUS_TONE[order.status]}`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
