import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Commande confirmée",
  description: "Votre commande est enregistrée — Photos Parallèles.",
};

/**
 * Order confirmation. The reference is passed via the URL; the order is looked
 * up server-side for the recap. We deliberately keep PII minimal here (no
 * customer name/address) — just reference + items + total — so the URL alone
 * doesn't leak personal data.
 */
export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const order = ref
    ? await prisma.order.findUnique({
        where: { reference: ref },
        include: { items: true },
      })
    : null;

  return (
    <>
      <div className="wrap page-head">
        <p className="label eyebrow label--accent">Merci</p>
        <h1>Commande enregistrée</h1>
      </div>

      <main className="wrap section" style={{ paddingTop: 0 }}>
        {!order ? (
          <div className="box cart-empty">
            <h3 className="cart-empty__title">Commande introuvable</h3>
            <p style={{ color: "var(--ink-soft)", maxWidth: "48ch" }}>
              Nous n&apos;avons pas retrouvé cette commande. Si vous venez de la
              passer, vérifiez votre email de confirmation.
            </p>
            <Link className="btn" href="/livres" style={{ marginTop: 18 }}>
              Retour à la collection
            </Link>
          </div>
        ) : (
          <div className="confirm">
            <div className="confirm__lead box">
              <p className="confirm__ref-label label">Référence</p>
              <p className="confirm__ref">{order.reference}</p>
              <p className="confirm__msg">
                Votre commande est enregistrée. Le paiement en ligne sera
                bientôt disponible — nous vous recontactons pour finaliser le
                règlement et l&apos;expédition.
              </p>
            </div>

            <aside className="confirm__recap box">
              <p className="label">Récapitulatif</p>
              <ul className="checkout-recap__items">
                {order.items.map((it) => (
                  <li key={it.id}>
                    <span className="checkout-recap__name">
                      {it.title}
                      <span className="checkout-recap__qty">
                        {" "}
                        × {it.quantity}
                      </span>
                    </span>
                    <span>{formatPrice((it.unitPriceCents * it.quantity) / 100)}</span>
                  </li>
                ))}
              </ul>
              <dl className="cart-totals">
                <div>
                  <dt>Sous-total</dt>
                  <dd>{formatPrice(order.subtotalCents / 100)}</dd>
                </div>
                <div>
                  <dt>Livraison — forfait unique</dt>
                  <dd>{formatPrice(order.shippingCents / 100)}</dd>
                </div>
                <div className="cart-totals__total">
                  <dt>Total</dt>
                  <dd>{formatPrice(order.totalCents / 100)}</dd>
                </div>
              </dl>
              <Link className="btn btn--block btn--ghost" href="/livres">
                Retour à la collection
              </Link>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
