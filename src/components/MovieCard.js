import { t } from "../theme";

export function MovieCard({ movie, onOpen, onToggleSaved, saved, compact = false }) {
  if (compact) {
    return (
      <div
        onClick={() => onOpen(movie)}
        style={{
          minWidth: 130,
          background: t.s,
          borderRadius: 18,
          padding: "14px 12px",
          cursor: "pointer",
          border: "1px solid " + t.b,
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 54,
          height: 54,
          borderRadius: 16,
          background: t.ad,
          border: "1px solid " + t.ab,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 10px",
          fontSize: 28,
        }}>
          {movie.poster}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>
          {movie.title}
        </div>
        <div style={{ fontSize: 10, color: t.tm, marginBottom: 6 }}>{movie.year}</div>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color: t.w,
          background: t.wa,
          padding: "2px 8px",
          borderRadius: 6,
        }}>
          ⭐ {movie.imdb}
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={() => onOpen(movie)}
      style={{
        background: t.s,
        borderRadius: 18,
        padding: 16,
        marginBottom: 10,
        cursor: "pointer",
        border: "1px solid " + t.b,
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      }}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{
          width: 58,
          height: 74,
          background: t.ad,
          border: "1px solid " + t.ab,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 30,
          flexShrink: 0,
        }}>
          {movie.poster}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, flex: 1 }}>
              {movie.title}
            </div>
            {onToggleSaved && (
              <button
                onClick={e => { e.stopPropagation(); onToggleSaved(movie.id); }}
                style={{
                  background: saved ? t.ad : "transparent",
                  border: "1.5px solid " + (saved ? t.ab : t.b),
                  borderRadius: 10,
                  color: saved ? t.a : t.tm,
                  fontSize: 15,
                  cursor: "pointer",
                  width: 34,
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
              >
                {saved ? "❤️" : "🤍"}
              </button>
            )}
          </div>
          <div style={{ fontSize: 12, color: t.tm, margin: "4px 0 8px" }}>
            {movie.year} · {movie.genre} · {movie.duration}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{
              padding: "3px 9px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              background: t.wa,
              color: t.w,
            }}>
              ⭐ {movie.imdb}
            </span>
            <span style={{
              padding: "3px 9px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              background: t.da,
              color: t.d,
            }}>
              🍅 {movie.rt}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
