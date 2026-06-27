import Link from "next/link";
import {
  umamiConfigured,
  getStats,
  getMetrics,
  type UmamiStats,
} from "@/lib/umami";

export const dynamic = "force-dynamic";

const RANGES = {
  "24h": { label: "24 heures", ms: 24 * 60 * 60 * 1000 },
  "7j": { label: "7 jours", ms: 7 * 24 * 60 * 60 * 1000 },
  "30j": { label: "30 jours", ms: 30 * 24 * 60 * 60 * 1000 },
} as const;

type RangeKey = keyof typeof RANGES;

function isRangeKey(value: string | undefined): value is RangeKey {
  return value === "24h" || value === "7j" || value === "30j";
}

const numberFmt = new Intl.NumberFormat("fr-FR");

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0 s";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m} min ${s.toString().padStart(2, "0")} s` : `${s} s`;
}

function formatPercent(part: number, whole: number): string {
  if (whole <= 0) return "0 %";
  return `${Math.round((part / whole) * 100)} %`;
}

function NotConfigured() {
  return (
    <div className="adm-card">
      <h2 className="adm-kpi__label" style={{ marginBottom: 10 }}>
        Analytics non configuré
      </h2>
      <p style={{ color: "var(--ink-soft)", maxWidth: "60ch" }}>
        Les statistiques d&apos;audience proviennent de l&apos;instance Umami
        auto-hébergée. Elles ne sont pas disponibles tant que les variables
        d&apos;environnement suivantes ne sont pas définies (voir{" "}
        <code>DEPLOY.md</code>, section « Activer l&apos;analytics Umami ») :
      </p>
      <ul className="adm-metric-list" style={{ marginTop: 16, maxWidth: 520 }}>
        {[
          ["UMAMI_API_URL", "URL interne de l'instance Umami"],
          ["UMAMI_USERNAME", "identifiant administrateur Umami"],
          ["UMAMI_PASSWORD", "mot de passe administrateur Umami"],
          ["UMAMI_WEBSITE_ID", "UUID du site dans Umami"],
        ].map(([name, desc]) => (
          <li key={name}>
            <span className="adm-metric__label">
              <code>{name}</code>
            </span>
            <span
              className="adm-metric__value"
              style={{ color: "var(--muted)", fontVariantNumeric: "normal" }}
            >
              {desc}
            </span>
          </li>
        ))}
      </ul>
      <p style={{ color: "var(--muted)", marginTop: 16, fontSize: "0.88rem" }}>
        Le script de suivi public est piloté séparément par{" "}
        <code>NEXT_PUBLIC_UMAMI_SRC</code> et{" "}
        <code>NEXT_PUBLIC_UMAMI_WEBSITE_ID</code>.
      </p>
    </div>
  );
}

function StatCards({ stats }: { stats: UmamiStats }) {
  const cards = [
    { label: "Visiteurs", value: numberFmt.format(stats.visitors) },
    { label: "Pages vues", value: numberFmt.format(stats.pageviews) },
    { label: "Visites", value: numberFmt.format(stats.visits) },
    {
      label: "Taux de rebond",
      value: formatPercent(stats.bounces, stats.visits),
    },
    {
      label: "Durée moyenne",
      value: formatDuration(
        stats.visits > 0 ? stats.totaltime / stats.visits : 0,
      ),
    },
  ];
  return (
    <div className="adm-grid adm-grid--kpi">
      {cards.map((c) => (
        <div key={c.label} className="adm-card">
          <span className="adm-kpi__label">{c.label}</span>
          <div className="adm-kpi__value" style={{ fontSize: "1.9rem" }}>
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricList({
  title,
  items,
  empty,
}: {
  title: string;
  items: { label: string; value: number }[];
  empty: string;
}) {
  return (
    <div className="adm-card">
      <h2 className="adm-kpi__label" style={{ marginBottom: 12 }}>
        {title}
      </h2>
      {items.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>{empty}</p>
      ) : (
        <ul className="adm-metric-list">
          {items.map((item, i) => (
            <li key={`${item.label}-${i}`}>
              <span className="adm-metric__label">{item.label}</span>
              <span className="adm-metric__value">
                {numberFmt.format(item.value)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const head = (
    <div className="adm-page-head">
      <div>
        <h1>Analytics</h1>
        <p>Audience du site, via Umami (sans cookie).</p>
      </div>
    </div>
  );

  if (!umamiConfigured()) {
    return (
      <>
        {head}
        <NotConfigured />
      </>
    );
  }

  const { range } = await searchParams;
  const rangeKey: RangeKey = isRangeKey(range) ? range : "7j";
  const endAt = Date.now();
  const startAt = endAt - RANGES[rangeKey].ms;

  // Degrade gracefully: a null/empty result means Umami was unreachable.
  const [stats, paths, referrers] = await Promise.all([
    getStats(startAt, endAt),
    getMetrics("path", startAt, endAt, 8),
    getMetrics("referrer", startAt, endAt, 8),
  ]);

  return (
    <>
      {head}

      <div className="adm-rangebar" style={{ marginBottom: 24 }}>
        {(Object.keys(RANGES) as RangeKey[]).map((key) => (
          <Link
            key={key}
            href={`/admin/analytics?range=${key}`}
            className={key === rangeKey ? "is-active" : undefined}
          >
            {RANGES[key].label}
          </Link>
        ))}
      </div>

      {stats === null ? (
        <div className="adm-alert adm-alert--info">
          Statistiques momentanément indisponibles (Umami injoignable). Réessayez
          plus tard.
        </div>
      ) : (
        <StatCards stats={stats} />
      )}

      <div className="adm-cols" style={{ marginTop: 24 }}>
        <MetricList
          title="Pages les plus vues"
          empty="Aucune donnée sur la période."
          items={paths.map((m) => ({ label: m.x ?? "(inconnu)", value: m.y }))}
        />
        <MetricList
          title="Sources de trafic"
          empty="Aucune donnée sur la période."
          items={referrers.map((m) => ({
            label: m.x && m.x.trim() ? m.x : "Direct / inconnu",
            value: m.y,
          }))}
        />
      </div>
    </>
  );
}
