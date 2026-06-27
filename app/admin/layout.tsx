import type { Metadata } from "next";
import "./admin.css";

/**
 * Thin admin layout. It only pulls in `admin.css` (so the stylesheet is scoped
 * to /admin — including the public login page) and tags the section noindex.
 * The protected shell + auth guard live in the `(dash)` group layout.
 */

export const metadata: Metadata = {
  title: "Back-office",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
