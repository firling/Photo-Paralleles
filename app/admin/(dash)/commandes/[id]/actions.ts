"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/admin";

function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as string[]).includes(value);
}

/** Update a single order's status from the detail page. */
export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !isOrderStatus(status)) return;

  await prisma.order.update({
    where: { id },
    data: { status },
  });

  revalidatePath(`/admin/commandes/${id}`);
  revalidatePath("/admin/commandes");
  revalidatePath("/admin");
}
