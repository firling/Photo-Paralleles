import { prisma } from "@/lib/db";
import { centsToEurosInput } from "@/lib/admin";
import SettingsForm, { type SettingsInitial } from "./SettingsForm";

export const dynamic = "force-dynamic";

const DEFAULTS = {
  shippingFlatCents: 600,
  currency: "EUR",
  contactEmail: null as string | null,
  instagramUrl: null as string | null,
  showBoxset: true,
  boxsetPriceCents: 13000,
};

export default async function SettingsPage() {
  const row = await prisma.siteSetting.findUnique({
    where: { id: "singleton" },
  });
  const s = row ?? DEFAULTS;

  const initial: SettingsInitial = {
    shippingFlatEuros: centsToEurosInput(s.shippingFlatCents),
    boxsetPriceEuros: centsToEurosInput(s.boxsetPriceCents),
    currency: s.currency,
    contactEmail: s.contactEmail ?? "",
    instagramUrl: s.instagramUrl ?? "",
    showBoxset: s.showBoxset,
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Réglages</h1>
          <p>Paramètres de la boutique (livraison, coffret, contact).</p>
        </div>
      </div>
      <div className="adm-card" style={{ maxWidth: 680 }}>
        <SettingsForm initial={initial} />
      </div>
    </>
  );
}
