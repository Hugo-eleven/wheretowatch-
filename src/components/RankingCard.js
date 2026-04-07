import { t } from "../theme";

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function RankingCard({ item, isLast }) {
  const medal = MEDALS[item.rank];

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "12px 16px",
      borderBottom: isLast ? "none" : "1px solid " + t.b,
    }}>
      <div style={{
        minWidth: 36,
        textAlign: "center",
        fontSize: medal ? 22 : 14,
        fontWeight: 800,
        color: item.rank <= 3 ? t.a : t.tm,
        lineHeight: 1,
      }}>
        {medal || `#${item.rank}`}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
          {item.title}
        </div>
        <div style={{ fontSize: 11, color: t.tm, marginTop: 2 }}>{item.year}</div>
      </div>
      <span style={{
        padding: "4px 10px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 700,
        background: t.wa,
        color: t.w,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}>
        ⭐ {item.score}
      </span>
    </div>
  );
}
