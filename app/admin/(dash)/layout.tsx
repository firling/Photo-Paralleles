import { requireAdmin } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

/**
 * Protected back-office layout. Guards every page in the `(dash)` group with
 * `requireAdmin()` (redirects to /admin/login when unauthenticated) and wraps
 * them in the sidebar shell.
 */
export default async function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  return <AdminShell email={admin.email}>{children}</AdminShell>;
}
