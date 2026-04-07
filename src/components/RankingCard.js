import { t } from "../theme";

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function RankingCard({ item, rank, isLast, onOpen }) {
  const medal = MEDALS[rank];

  return (
    <div
      onClick={() => onOpen && onOpen(item)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 16px",
        borderBottom: isLast ? "none" : "1px solid " + t.b,
        cursor: onOpen ? "pointer" : "default",
        transition: "background 0.12s",
      }}
      onMouseEnter={e => { if (onOpen) e.currentTarget.style.background = t.sh; }}
      onMouseLeave={e => { e.currentTarget.style.background = ""; }}
    >
      <div style={{
        minWidth: 34,
        textAlign: "center",
        fontSize: medal ? 20 : 13,
        fontWeight: 800,
        color: rank <= 3 ? t.a : t.tm,
        lineHeight: 1,
      }}>
        {medal || `#${rank}`}
      </div>

      {item.poster && (
        <img
          src={item.poster.replace("/w500", "/w92")}
          alt=""
          style={{ width: 32, height: 44, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
        />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.title}
        </div>
        <div style={{ fontSize: 11, color: t.tm, marginTop: 1 }}>{item.year}</div>
      </div>

      {item.imdb && (
        <span style={{
          padding: "3px 10px", borderRadius: 8,
          fontSize: 11, fontWeight: 700,
          background: t.wa, color: t.w,
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          ⭐ {item.imdb}
        </span>
      )}
    </div>
  );
}
