import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  formatCents,
  formatDateTime,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  ORDER_STATUSES,
} from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [bookCount, artistCount, projectCount, orderCount, statusGroups, latestOrders] =
    await Promise.all([
      prisma.book.count(),
      prisma.artist.count(),
      prisma.project.count(),
      prisma.order.count(),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const countByStatus = new Map(
    statusGroups.map((g) => [g.status, g._count._all]),
  );

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue d&apos;ensemble du catalogue et des commandes.</p>
        </div>
      </div>

      <div className="adm-grid adm-grid--kpi">
        <div className="adm-card">
          <span className="adm-kpi__label">Livres</span>
          <div className="adm-kpi__value">{bookCount}</div>
          <div className="adm-kpi__hint">au catalogue</div>
        </div>
        <div className="adm-card">
          <span className="adm-kpi__label">Artistes</span>
          <div className="adm-kpi__value">{artistCount}</div>
          <div className="adm-kpi__hint">publiés et brouillons</div>
        </div>
        <div className="adm-card">
          <span className="adm-kpi__label">Projets</span>
          <div className="adm-kpi__value">{projectCount}</div>
          <div className="adm-kpi__hint">expositions, éditions…</div>
        </div>
        <div className="adm-card">
          <span className="adm-kpi__label">Commandes</span>
          <div className="adm-kpi__value">{orderCount}</div>
          <div className="adm-kpi__hint">toutes périodes</div>
        </div>
      </div>

      <section className="adm-section">
        <h2>Commandes par statut</h2>
        <div className="adm-statusrow">
          {ORDER_STATUSES.map((status) => (
            <span
              key={status}
              className={`adm-badge adm-badge--${ORDER_STATUS_TONE[status]}`}
            >
              {ORDER_STATUS_LABELS[status]} · {countByStatus.get(status) ?? 0}
            </span>
          ))}
        </div>
      </section>

      <section className="adm-section">
        <h2>Dernières commandes</h2>
        {latestOrders.length === 0 ? (
          <div className="adm-empty">
            <h3>Aucune commande pour l&apos;instant</h3>
            <p>Les commandes apparaîtront ici dès l&apos;ouverture du paiement.</p>
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
                {latestOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="adm-mono">
                      <Link href={`/admin/commandes/${order.id}`}>
                        {order.reference}
                      </Link>
                    </td>
                    <td>{formatDateTime(order.createdAt)}</td>
                    <td>{order.customerName}</td>
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
      </section>
    </>
  );
}
