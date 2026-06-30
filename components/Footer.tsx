import Link from "next/link";
import { social } from "@/lib/content";

/** Site footer — ported from the validated mockups. */
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="flogo" src="/brand/logo-light.png" alt="Photos Parallèles" />
            <p>
              Association photographique fondée en 2023 par Jean-Matthieu
              Gosselin et Ullic Morard. Implantée aux portes d&apos;Annecy.
            </p>
          </div>
          <div className="fcol">
            <h4>Explorer</h4>
            <Link href="/association">L&apos;association</Link>
            <Link href="/projets">Les projets</Link>
            <Link href="/livres">La collection</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="fcol">
            <h4>Suivre</h4>
            <a href={social.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/cgv">CGV</Link>
          </div>
        </div>
        <div className="footer-base">
          <span>© 2026 Photos Parallèles</span>
          <span>
            Site réalisé par{" "}
            <a
              href="https://julien.anquetil.org"
              target="_blank"
              rel="noreferrer"
            >
              Julien Anquetil
            </a>
          </span>
          <span>Annecy · France</span>
        </div>
      </div>
    </footer>
  );
}
