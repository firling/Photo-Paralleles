"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Injects the Umami tracking script, except on excluded path prefixes.
 *
 * Values come from the host (Registring injects UMAMI_SCRIPT_URL / UMAMI_WEBSITE_ID /
 * UMAMI_EXCLUDE_PATHS), so analytics is configured without a rebuild.
 *
 * Exclusion is done by simply NOT rendering the tracker on excluded routes — reliable and
 * independent of any Umami version (a "/admin" prefix covers "/admin" and everything under
 * it). The query string is ignored: usePathname() returns the path only.
 */
export default function UmamiTracker({
  src,
  websiteId,
  excludePaths,
}: {
  src?: string;
  websiteId?: string;
  excludePaths?: string;
}) {
  const pathname = usePathname() ?? "/";

  if (!src || !websiteId) return null;

  const excluded = (excludePaths ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .some((p) => {
      const prefix = p.replace(/\/+$/, "");
      return pathname === prefix || pathname.startsWith(`${prefix}/`);
    });
  if (excluded) return null;

  return (
    <Script src={src} data-website-id={websiteId} strategy="afterInteractive" />
  );
}
