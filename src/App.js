import { useState } from "react";
import { t } from "./theme";
import { MOVIES, SPORTS, RANKINGS } from "./data";
import { Navigation } from "./components/Navigation";
import { MovieCard } from "./components/MovieCard";
import { SportCard } from "./components/SportCard";
import { RankingCard } from "./components/RankingCard";

const WRAP = {
  fontFamily: "'Segoe UI', system-ui, sans-serif",
  background: t.bg,
  color: t.tx,
  minHeight: "100vh",
  maxWidth: 480,
  margin: "0 auto",
  paddingBottom: 90,
};

function Logo() {
  return (
    <div style={{ fontSize: 20, fontWeight: 800, color: t.a, letterSpacing: -0.5 }}>
      Where<span style={{ color: t.tx, fontWeight: 400 }}>to</span>Watch
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: 11,
      fontWeight: 800,
      color: t.tm,
      textTransform: "uppercase",
      letterSpacing: 1.5,
      marginBottom: 12,
    }}>
      <div style={{ width: 3, height: 14, borderRadius: 2, background: t.a }} />
      {children}
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState("home");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [prevScreen, setPrevScreen] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedMovies, setSavedMovies] = useState([]);

  function openMovie(movie, from) {
    setPrevScreen(from || screen);
    setSelectedMovie(movie);
    setScreen("detail");
  }

  function toggleSaved(id) {
    setSavedMovies(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  const isSaved = id => savedMovies.includes(id);

  const filtered = MOVIES.filter(m => {
    const q = searchQuery.toLowerCase();
    return m.title.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q);
  });

  // ====== HOME ======
  if (screen === "home") {
    return (
      <div style={WRAP}>
        <div style={{ padding: "22px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo />
          <span style={{
            background: t.ad,
            color: t.a,
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 20,
            border: "1px solid " + t.ab,
          }}>
            v0.1 DEMO
          </span>
        </div>

        <div style={{ padding: "8px 20px 24px" }}>
          <h2 style={{ fontSize: 23, fontWeight: 800, margin: "0 0 4px", lineHeight: 1.3 }}>
            Znajdź gdzie obejrzeć{" "}
            <span style={{ color: t.a }}>cokolwiek chcesz.</span>
          </h2>
          <p style={{ fontSize: 13, color: t.tm, margin: 0 }}>
            Filmy, seriale i sport — wszystko w jednym miejscu.
          </p>
        </div>

        {/* Popularne teraz */}
        <div style={{ padding: "0 20px", marginBottom: 28 }}>
          <SectionHeader>Popularne teraz</SectionHeader>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
            {MOVIES.slice(0, 4).map(m => (
              <MovieCard key={m.id} movie={m} onOpen={openMovie} compact />
            ))}
          </div>
        </div>

        {/* IMDb Top */}
        <div style={{ padding: "0 20px", marginBottom: 28 }}>
          <SectionHeader>IMDb Top 8</SectionHeader>
          <div style={{
            background: t.s,
            borderRadius: 18,
            border: "1px solid " + t.b,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}>
            {RANKINGS.map((item, i) => (
              <RankingCard key={item.rank} item={item} isLast={i === RANKINGS.length - 1} />
            ))}
          </div>
        </div>

        {/* Nadchodzące wydarzenia */}
        <div style={{ padding: "0 20px", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <SectionHeader>Nadchodzące</SectionHeader>
            <button
              onClick={() => setScreen("sports")}
              style={{
                background: "none",
                border: "none",
                color: t.a,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
              }}
            >
              Więcej →
            </button>
          </div>
          {SPORTS.slice(0, 2).map(s => (
            <SportCard key={s.id} sport={s} />
          ))}
        </div>

        <Navigation screen={screen} setScreen={setScreen} />
      </div>
    );
  }

  // ====== SEARCH ======
  if (screen === "search") {
    return (
      <div style={WRAP}>
        <div style={{ padding: "22px 20px 10px" }}>
          <Logo />
        </div>
        <div style={{ padding: "8px 20px 20px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 16px" }}>Wyszukaj</h2>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 16,
              pointerEvents: "none",
            }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Film, serial, gatunek..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: t.s,
                border: "1.5px solid " + (searchQuery ? t.a : t.b),
                borderRadius: 14,
                padding: "14px 16px 14px 44px",
                color: t.tx,
                fontSize: 15,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
            />
          </div>
        </div>

        <div style={{ padding: "0 20px" }}>
          {filtered.length > 0 ? filtered.map(m => (
            <MovieCard
              key={m.id}
              movie={m}
              onOpen={openMovie}
              onToggleSaved={toggleSaved}
              saved={isSaved(m.id)}
            />
          )) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: t.tm }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Brak wyników</div>
              <div style={{ fontSize: 13 }}>Spróbuj innej frazy</div>
            </div>
          )}
        </div>

        <Navigation screen={screen} setScreen={setScreen} />
      </div>
    );
  }

  // ====== DETAIL ======
  if (screen === "detail" && selectedMovie) {
    const m = selectedMovie;
    return (
      <div style={WRAP}>
        <div style={{ padding: "16px 20px" }}>
          <button
            onClick={() => setScreen(prevScreen)}
            style={{
              background: t.s,
              border: "1px solid " + t.b,
              borderRadius: 10,
              color: t.a,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              padding: "7px 14px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ← Wróć
          </button>
        </div>

        {/* Hero */}
        <div style={{ margin: "0 20px 24px" }}>
          <div style={{
            background: t.s,
            borderRadius: 22,
            padding: "28px 20px 24px",
            textAlign: "center",
            border: "1px solid " + t.b,
            boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 22,
              background: t.ad,
              border: "1.5px solid " + t.ab,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 40,
            }}>
              {m.poster}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px", lineHeight: 1.2 }}>
              {m.title}
            </h1>
            <div style={{ fontSize: 13, color: t.tm, marginBottom: 14 }}>
              {m.year} · {m.genre} · {m.duration}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <span style={{
                padding: "5px 14px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                background: t.wa,
                color: t.w,
              }}>
                ⭐ {m.imdb} IMDb
              </span>
              <span style={{
                padding: "5px 14px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                background: t.da,
                color: t.d,
              }}>
                🍅 {m.rt}% RT
              </span>
            </div>
          </div>
        </div>

        {/* Info sections */}
        <div style={{ padding: "0 20px" }}>
          <div style={{ marginBottom: 20 }}>
            <SectionHeader>Opis</SectionHeader>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: t.tm, margin: 0 }}>{m.synopsis}</p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <SectionHeader>Reżyser</SectionHeader>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: t.s,
              border: "1px solid " + t.b,
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 14,
              fontWeight: 600,
            }}>
              🎬 {m.director}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <SectionHeader>Obsada</SectionHeader>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {m.cast.map(c => (
                <span key={c} style={{
                  fontSize: 13,
                  padding: "6px 12px",
                  borderRadius: 10,
                  background: t.ad,
                  border: "1px solid " + t.ab,
                  color: t.a,
                  fontWeight: 600,
                }}>
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <SectionHeader>Gdzie obejrzeć</SectionHeader>
            {m.platforms.map(p => (
              <div key={p.name} style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: t.s,
                border: "1.5px solid " + t.b,
                borderRadius: 14,
                padding: "12px 16px",
                marginBottom: 8,
                boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: p.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#fff",
                  flexShrink: 0,
                }}>
                  {p.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: t.tm, marginTop: 1 }}>{p.price}</div>
                </div>
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: t.a,
                  padding: "7px 16px",
                  borderRadius: 10,
                  background: t.ad,
                  border: "1px solid " + t.ab,
                }}>
                  Oglądaj
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => toggleSaved(m.id)}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 16,
                border: "2px solid " + (isSaved(m.id) ? t.a : t.b),
                background: isSaved(m.id) ? t.ad : t.s,
                color: isSaved(m.id) ? t.a : t.tx,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.15s",
              }}
            >
              {isSaved(m.id) ? "❤️ Zapisano na liście" : "🤍 Dodaj do mojej listy"}
            </button>
          </div>
        </div>

        <Navigation screen="search" setScreen={setScreen} />
      </div>
    );
  }

  // ====== SPORTS ======
  if (screen === "sports") {
    return (
      <div style={WRAP}>
        <div style={{ padding: "22px 20px 10px" }}>
          <Logo />
        </div>
        <div style={{ padding: "8px 20px 20px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
            ⚽ Sport na żywo
          </h2>
          <p style={{ fontSize: 13, color: t.tm, margin: "4px 0 0" }}>
            Najbliższe transmisje w Polsce
          </p>
        </div>
        <div style={{ padding: "0 20px" }}>
          {SPORTS.map(s => <SportCard key={s.id} sport={s} />)}
        </div>
        <Navigation screen={screen} setScreen={setScreen} />
      </div>
    );
  }

  // ====== SAVED ======
  const savedList = MOVIES.filter(m => savedMovies.includes(m.id));
  return (
    <div style={WRAP}>
      <div style={{ padding: "22px 20px 10px" }}>
        <Logo />
      </div>
      <div style={{ padding: "8px 20px 20px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
          ❤️ Moja lista
        </h2>
        <p style={{ fontSize: 13, color: t.tm, margin: "4px 0 0" }}>
          {savedList.length > 0
            ? `${savedList.length} tytuł${savedList.length === 1 ? "" : savedList.length < 5 ? "y" : "ów"}`
            : "Brak zapisanych tytułów"}
        </p>
      </div>
      <div style={{ padding: "0 20px" }}>
        {savedList.length > 0 ? savedList.map(m => (
          <MovieCard
            key={m.id}
            movie={m}
            onOpen={openMovie}
            onToggleSaved={toggleSaved}
            saved
          />
        )) : (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: t.tm,
          }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🤍</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: t.tx }}>
              Twoja lista jest pusta
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>
              Dodaj filmy klikając 🤍 przy tytule
            </div>
          </div>
        )}
      </div>
      <Navigation screen={screen} setScreen={setScreen} />
    </div>
  );
}

export default App;
