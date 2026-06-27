"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

/**
 * Public admin login. Server Action validates credentials and opens the session;
 * on success it redirects to /admin, otherwise it returns an inline error.
 */
export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <div className="adm-auth">
      <div className="adm-auth__card">
        <div className="adm-auth__brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-dark.png" alt="Photos Parallèles" />
          <span className="adm-kpi__label">Back-office</span>
        </div>
        <h1>Connexion</h1>

        <form action={formAction} className="adm-form" style={{ marginTop: 20 }}>
          {state.error ? (
            <div className="adm-alert adm-alert--error" role="alert">
              {state.error}
            </div>
          ) : null}

          <div className="adm-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              autoFocus
            />
          </div>

          <div className="adm-field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="adm-btn adm-btn--accent adm-btn--block"
            disabled={pending}
          >
            {pending ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
