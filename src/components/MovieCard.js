import { t } from "../theme";

function Poster({ src, size = 30, radius = 14, style = {} }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: radius,
          display: "block",
          ...style,
        }}
      />
    );
  }
  return (
    <span style={{ fontSize: size, lineHeight: 1 }}>🎬</span>
  );
}

export function MovieCard({ movie, onOpen, onToggleSaved, saved, compact = false }) {
  if (compact) {
    return (
      <div
        onClick={() => onOpen(movie)}
        className="card-fade-in"
        style={{
          minWidth: 130,
          background: t.s,
          borderRadius: 18,
          overflow: "hidden",
          cursor: "pointer",
          border: "1px solid " + t.b,
          boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
          flexShrink: 0,
        }}
      >
        <div style={{
          width: "100%",
          height: 160,
          background: t.ad,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}>
          <Poster src={movie.poster} size={40} radius={0} />
        </div>
        <div style={{ padding: "10px 12px 12px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>
            {movie.title}
          </div>
          <div style={{ fontSize: 10, color: t.tm, marginBottom: 6 }}>{movie.year}</div>
          {movie.imdb && (
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
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onOpen(movie)}
      className="card-fade-in"
      style={{
        background: t.s,
        borderRadius: 18,
        padding: 14,
        marginBottom: 10,
        cursor: "pointer",
        border: "1px solid " + t.b,
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        transition: "box-shadow 0.15s",
      }}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{
          width: 58,
          height: 80,
          background: t.ad,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
        }}>
          <Poster src={movie.poster} size={28} radius={12} />
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
                }}
              >
                {saved ? "❤️" : "🤍"}
              </button>
            )}
          </div>
          <div style={{ fontSize: 12, color: t.tm, margin: "4px 0 8px" }}>
            {[movie.year, movie.genre, movie.duration].filter(Boolean).join(" · ")}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {movie.imdb && (
              <span style={{
                padding: "3px 9px", borderRadius: 8,
                fontSize: 11, fontWeight: 700,
                background: t.wa, color: t.w,
              }}>
                ⭐ {movie.imdb}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
