import type { Metadata } from "next";
import { getSettings } from "@/lib/queries";
import CheckoutView from "./CheckoutView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Commande",
  description: "Finaliser votre commande — Photos Parallèles.",
};

export default async function CheckoutPage() {
  const settings = await getSettings();
  return (
    <CheckoutView
      shippingFlatCents={settings.shippingFlatCents}
      currency={settings.currency}
    />
  );
}
