import Script from "next/script";

/**
 * Injects the Umami tracking script and, optionally, excludes path prefixes from
 * tracking. Values come from the host (e.g. Registring injects UMAMI_SCRIPT_URL /
 * UMAMI_WEBSITE_ID / UMAMI_EXCLUDE_PATHS), so analytics is configured without a rebuild.
 *
 * Exclusion uses Umami's `data-before-send` hook: a global function that runs before
 * every event is sent and cancels it when the URL starts with an excluded prefix. This
 * covers both the initial page load AND client-side SPA navigations (the auto-tracker
 * patches history, so simply not rendering the script on excluded pages would not stop
 * tracking once it has loaded on a public page).
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
  if (!src || !websiteId) return null;

  const prefixes = (excludePaths ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  // A path matches if it equals the prefix or sits under it (prefix + "/"), so "/admin"
  // covers "/admin" and "/admin/…" but not e.g. "/administrators".
  const filter = `window.__umamiBeforeSend=function(type,payload){try{var url=((payload&&payload.url)||"").split("?")[0];var ex=${JSON.stringify(
    prefixes,
  )};for(var i=0;i<ex.length;i++){var e=ex[i].replace(/\\/+$/,"");if(url===e||url.indexOf(e+"/")===0)return false;}}catch(e){}return payload;};`;

  return (
    <>
      {prefixes.length > 0 && (
        <Script id="umami-exclude" strategy="beforeInteractive">
          {filter}
        </Script>
      )}
      <Script
        src={src}
        data-website-id={websiteId}
        {...(prefixes.length > 0 ? { "data-before-send": "__umamiBeforeSend" } : {})}
        strategy="afterInteractive"
      />
    </>
  );
}
