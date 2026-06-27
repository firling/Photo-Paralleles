"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

const NAV_LINKS = [
  { href: "/association", label: "Association" },
  { href: "/artistes", label: "Artistes" },
  { href: "/livres", label: "Livres" },
  { href: "/contact", label: "Contact" },
];

/**
 * Site header — ported from the validated mockups.
 * Desktop shows the inline nav; below the mobile breakpoint a hamburger
 * toggles a full-screen drawer. The cart count is static for now (the cart
 * is a later increment).
 */
export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { count, ready } = useCart();
  // Render an empty badge until hydrated so server and first client render match.
  const badge = ready ? count : 0;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll + close on Escape while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="site-header">
        <div className="wrap site-header__inner">
        <Link className="brand" href="/">
          {/* Plain img: fixed-height logo, no layout sizing needed. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-dark.png" alt="Photos Parallèles" />
        </Link>
        <nav className="nav">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "is-active" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-tools">
          <Link className="cart" href="/panier">
            Panier <i className="dot" key={badge} data-has={badge > 0}>{badge}</i>
          </Link>
          <button
            type="button"
            className={`nav-toggle${open ? " is-open" : ""}`}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="nav-toggle__bars" aria-hidden="true" />
          </button>
        </div>
        </div>
      </header>

      {/* Drawer rendered as a sibling of <header>: the header's backdrop-filter
          would otherwise become the containing block for this fixed element. */}
      <div
        id="mobile-nav"
        className={`mobile-nav${open ? " is-open" : ""}`}
        hidden={!open}
      >
        <nav className="mobile-nav__list">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "is-active" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            className="mobile-nav__cart"
            href="/panier"
            onClick={() => setOpen(false)}
          >
            Panier <i className="dot" key={badge} data-has={badge > 0}>{badge}</i>
          </Link>
        </nav>
      </div>
    </>
  );
}
