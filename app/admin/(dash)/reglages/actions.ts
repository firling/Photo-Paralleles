"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { eurosToCents } from "@/lib/admin";

export interface SettingsState {
  ok?: boolean;
  error?: string;
}

/**
 * Update the SiteSetting singleton. Shipping + boxset prices come in as euros and
 * are stored as cents. Revalidates the public routes that read these values.
 */
export async function saveSettingsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireAdmin();

  const shippingFlatCents = eurosToCents(
    String(formData.get("shippingFlatEuros") ?? ""),
  );
  const boxsetPriceCents = eurosToCents(
    String(formData.get("boxsetPriceEuros") ?? ""),
  );
  const currency = String(formData.get("currency") ?? "EUR").trim() || "EUR";
  const contactEmailRaw = String(formData.get("contactEmail") ?? "").trim();
  const instagramUrlRaw = String(formData.get("instagramUrl") ?? "").trim();
  const showBoxset = formData.get("showBoxset") === "on";

  const contactEmail = contactEmailRaw || null;
  const instagramUrl = instagramUrlRaw || null;

  if (instagramUrl && !/^https?:\/\//i.test(instagramUrl)) {
    return { error: "L'URL Instagram doit commencer par http(s)://." };
  }

  const data = {
    shippingFlatCents,
    boxsetPriceCents,
    currency,
    contactEmail,
    instagramUrl,
    showBoxset,
  };

  try {
    await prisma.siteSetting.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", ...data },
      update: data,
    });
  } catch {
    return { error: "Échec de l'enregistrement. Réessayez." };
  }

  revalidatePath("/livres");
  revalidatePath("/");
  return { ok: true };
}
