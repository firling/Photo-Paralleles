import type { Metadata } from "next";
import { getSettings } from "@/lib/queries";
import CartView from "./CartView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panier",
  description: "Votre panier — Photos Parallèles.",
};

export default async function CartPage() {
  const settings = await getSettings();
  return (
    <CartView
      shippingFlatCents={settings.shippingFlatCents}
      currency={settings.currency}
    />
  );
}
