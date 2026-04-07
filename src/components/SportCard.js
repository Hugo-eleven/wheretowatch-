import { t } from "../theme";

export function SportCard({ sport }) {
  return (
    <div style={{
      background: t.s,
      borderRadius: 18,
      padding: 16,
      marginBottom: 10,
      border: "1px solid " + t.b,
      boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: t.ad,
          border: "1px solid " + t.ab,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          flexShrink: 0,
        }}>
          {sport.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 10,
            color: t.a,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: 2,
          }}>
            {sport.event}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>
            {sport.teams}
          </div>
        </div>
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
        fontSize: 12,
        color: t.tm,
        background: t.sh,
        borderRadius: 10,
        padding: "6px 10px",
      }}>
        <span style={{ fontSize: 13 }}>📅</span>
        {sport.date}
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {sport.platforms.map(p => {
          const isFree = p.price === "Za darmo";
          return (
            <span
              key={p.name}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "5px 12px",
                borderRadius: 8,
                background: isFree ? "rgba(0,229,160,0.12)" : t.sh,
                color: isFree ? t.a : t.tx,
                border: "1px solid " + (isFree ? "rgba(0,229,160,0.3)" : t.b),
              }}
            >
              {p.name} · {p.price}
            </span>
          );
        })}
      </div>
    </div>
  );
}
