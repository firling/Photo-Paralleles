import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UmamiTracker from "@/components/UmamiTracker";
import { CartProvider } from "@/lib/cart";
import { association } from "@/lib/content";
import "./globals.css";

// Contemporary editorial pairing: Space Grotesk (display / headings) + Inter
// (body). Loaded as variable fonts so any weight (incl. the 350 body weight)
// resolves crisply.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Photos Parallèles",
    template: "%s — Photos Parallèles",
  },
  description: association.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Privacy-friendly Umami analytics: rendered only once the instance is
  // configured (script URL + website id). No cookie banner needed.
  //
  // This root layout is a SERVER component, so it reads env at request time —
  // prefer the runtime vars (injected by the host, e.g. Registring's Umami link)
  // so the script can be (re)configured without rebuilding the image. The
  // NEXT_PUBLIC_* values are kept as a build-time fallback for plain compose.
  const umamiSrc = process.env.UMAMI_SCRIPT_URL ?? process.env.NEXT_PUBLIC_UMAMI_SRC;
  const umamiWebsiteId =
    process.env.UMAMI_WEBSITE_ID ?? process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  // Path prefixes excluded from tracking (e.g. "/admin"), configured in Registring.
  const umamiExcludePaths = process.env.UMAMI_EXCLUDE_PATHS;

  return (
    <html lang="fr" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        <CartProvider>
          <Header />
          {children}
          <Footer />
        </CartProvider>
        <UmamiTracker
          src={umamiSrc}
          websiteId={umamiWebsiteId}
          excludePaths={umamiExcludePaths}
        />
      </body>
    </html>
  );
}
