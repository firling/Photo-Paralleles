"use server";

import { redirect } from "next/navigation";
import { endSession } from "@/lib/session";

/** Logout Server Action: clears the session cookie and returns to login. */
export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}
