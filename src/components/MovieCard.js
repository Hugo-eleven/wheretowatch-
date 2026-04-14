import { t } from "../theme";

export function MovieCard({ movie, onOpen, onToggleSaved, saved, compact = false }) {
  if (compact) {
    return (
      <div
        onClick={() => onOpen(movie)}
        className="card-fade-in compact-card-hover"
        style={{
          minWidth: 180,
          background: t.s,
          borderRadius: 18,
          overflow: "hidden",
          cursor: "pointer",
          border: "1px solid " + t.b,
          boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
          flexShrink: 0,
          position: "relative",
          height: 240,
        }}
      >
        {/* Poster */}
        <div style={{ width: "100%", height: "100%", background: t.ad, overflow: "hidden" }}>
          {movie.poster ? (
            <img
              src={movie.poster}
              alt=""
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 40 }}>🎬</div>
          )}
        </div>
        {/* Heart button */}
        {onToggleSaved && (
          <button
            onClick={e => { e.stopPropagation(); onToggleSaved(movie.id, movie.mediaType); }}
            style={{
              position: "absolute", top: 8, right: 8,
              width: 24, height: 24,
              background: "rgba(0,0,0,0.45)",
              border: "none", borderRadius: "50%",
              fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            {saved ? "❤️" : "🤍"}
          </button>
        )}
        {/* Gradient overlay with title */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(transparent, rgba(0,0,0,0.92))",
          padding: "48px 12px 12px",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3, color: "#E8ECF4", marginBottom: 3 }}>
            {movie.title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {movie.imdb && (
              <span style={{ fontSize: 10, fontWeight: 700, color: "#FFB547" }}>⭐ {movie.imdb}</span>
            )}
            <span style={{ fontSize: 10, color: "rgba(232,236,244,0.55)" }}>{movie.year}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onOpen(movie)}
      className="card-fade-in movie-card-hover"
      style={{
        background: t.s,
        borderRadius: 18,
        padding: 14,
        marginBottom: 10,
        cursor: "pointer",
        border: "1px solid " + t.b,
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
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
          {movie.poster ? (
            <img
              src={movie.poster}
              alt=""
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12, display: "block" }}
            />
          ) : (
            <span style={{ fontSize: 28, lineHeight: 1 }}>🎬</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, flex: 1 }}>
              {movie.title}
            </div>
            {onToggleSaved && (
              <button
                onClick={e => { e.stopPropagation(); onToggleSaved(movie.id, movie.mediaType); }}
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
