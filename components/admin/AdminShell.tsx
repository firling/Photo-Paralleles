"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";

/**
 * Back-office shell: sidebar navigation + content area. Client component so the
 * active link can be derived from the pathname. Logout is a Server Action passed
 * to a form. Catalogue (Livres / Artistes) links are intentional placeholders
 * for the next increment.
 */

interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
}

const MAIN_NAV: NavItem[] = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/reglages", label: "Réglages" },
  { href: "/admin/analytics", label: "Analytics" },
];

// Catalog CRUD (books + artists) with image upload + Tiptap rich text.
const CATALOG_NAV: NavItem[] = [
  { href: "/admin/livres", label: "Livres" },
  { href: "/admin/artistes", label: "Artistes" },
  { href: "/admin/projets", label: "Projets" },
];

export default function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="adm-shell">
      <aside className="adm-sidebar">
        <div className="adm-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-light.png" alt="Photos Parallèles" />
          <b>Back-office</b>
        </div>

        <nav className="adm-nav">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item) ? "is-active" : undefined}
            >
              {item.label}
            </Link>
          ))}

          <div className="adm-nav__section">Catalogue</div>
          {CATALOG_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item) ? "is-active" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="adm-sidebar__foot">
          <span className="adm-sidebar__email">{email}</span>
          <div className="adm-sidebar__links">
            <Link href="/" target="_blank" rel="noreferrer">
              Voir le site ↗
            </Link>
          </div>
          <form action={logoutAction} className="adm-logout">
            <button type="submit">Se déconnecter</button>
          </form>
        </div>
      </aside>

      <main className="adm-main">{children}</main>
    </div>
  );
}
