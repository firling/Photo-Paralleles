import type { Metadata } from "next";
import { social } from "@/lib/content";
import { submitContact } from "./actions";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Écrire à l'association Photos Parallèles et retrouver ses réseaux sociaux.",
};

export default function ContactPage() {
  return (
    <>
      <div className="wrap page-head">
        <p className="label eyebrow label--accent">Nous écrire</p>
        <h1>Contact</h1>
        <p>
          Une question sur la collection, une proposition d&apos;exposition ou de
          collaboration ? Écrivez-nous — nous lisons chaque message.
        </p>
      </div>

      <main className="wrap section" style={{ paddingTop: 0 }}>
        <div className="grid-2">
          <form className="form" action={submitContact}>
            <div className="field">
              <label htmlFor="name">Nom</label>
              <input id="name" name="name" type="text" required autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" required />
            </div>
            <button type="submit" className="btn">
              Envoyer
            </button>
            <p className="note">
              Envoi des emails bientôt disponible. Votre message est enregistré
              côté serveur en attendant.
            </p>
          </form>

          <div className="stack">
            <div className="box">
              <p className="label">Suivre</p>
              <h3
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "var(--step-1)",
                  margin: "8px 0 12px",
                }}
              >
                Sur les réseaux
              </h3>
              <p style={{ color: "var(--ink-soft)", marginBottom: 16 }}>
                Retrouvez les coulisses de la collection et des artistes sur
                Instagram.
              </p>
              <a
                className="btn btn--ghost"
                href={social.instagram}
                target="_blank"
                rel="noreferrer"
              >
                Instagram {social.instagramHandle}
              </a>
            </div>
            <div className="box">
              <p className="label">L&apos;association</p>
              <p style={{ color: "var(--ink-soft)", marginTop: 12 }}>
                Photos Parallèles — association photographique implantée aux
                portes d&apos;Annecy, France.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
