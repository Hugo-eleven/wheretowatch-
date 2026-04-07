import { useState } from "react";

const MOVIES = [
  { id: 1, title: "Dune: Part Three", year: 2026, genre: "Sci-Fi", imdb: 8.9, rt: 95, poster: "D", duration: "2h 45m", director: "Denis Villeneuve", cast: ["Timothee Chalamet", "Zendaya"], synopsis: "Kontynuacja epickiej sagi na Arrakis.", platforms: [{ name: "Netflix", price: "33 zl/msc", color: "#E50914" }, { name: "Max", price: "29.99 zl/msc", color: "#002BE7" }] },
  { id: 2, title: "The Brutalist", year: 2025, genre: "Drama", imdb: 8.4, rt: 97, poster: "B", duration: "3h 35m", director: "Brady Corbet", cast: ["Adrien Brody", "Felicity Jones"], synopsis: "Historia architekta uciekajacego z Europy.", platforms: [{ name: "Apple TV+", price: "34.99 zl/msc", color: "#555555" }] },
  { id: 3, title: "Konklawe", year: 2024, genre: "Thriller", imdb: 7.8, rt: 93, poster: "K", duration: "2h 00m", director: "Edward Berger", cast: ["Ralph Fiennes", "Stanley Tucci"], synopsis: "Kardynalowie wybieraja nowego papieza.", platforms: [{ name: "Canal+", price: "45 zl/msc", color: "#1A1A1A" }, { name: "Amazon Prime", price: "49 zl/rok", color: "#00A8E1" }] },
  { id: 4, title: "Oppenheimer", year: 2023, genre: "Biography", imdb: 8.3, rt: 93, poster: "O", duration: "3h 01m", director: "Christopher Nolan", cast: ["Cillian Murphy", "Emily Blunt"], synopsis: "Historia tworcy bomby atomowej.", platforms: [{ name: "SkyShowtime", price: "19.99 zl/msc", color: "#6B3FA0" }] },
  { id: 5, title: "Shogun", year: 2024, genre: "Serial", imdb: 8.7, rt: 99, poster: "S", duration: "10 odc.", director: "Rachel Kondo", cast: ["Hiroyuki Sanada", "Anna Sawai"], synopsis: "Angielski zeglarz w feudalnej Japonii.", platforms: [{ name: "Disney+", price: "37.99 zl/msc", color: "#0063E5" }] },
  { id: 6, title: "Diabelskie miasto", year: 2025, genre: "Serial", imdb: 8.1, rt: 88, poster: "M", duration: "8 odc.", director: "Martin Scorsese", cast: ["Leonardo DiCaprio"], synopsis: "Mroczny serial w Chicago lat 20.", platforms: [{ name: "Apple TV+", price: "34.99 zl/msc", color: "#555555" }, { name: "Netflix", price: "33 zl/msc", color: "#E50914" }] }
];

const SPORTS = [
  { id: 1, event: "Liga Mistrzow - Polfinal", teams: "Real Madryt vs Arsenal", date: "8 kwi 2026, 21:00", icon: "F", platforms: [{ name: "Canal+", price: "45 zl/msc" }, { name: "TVP Sport", price: "Za darmo" }] },
  { id: 2, event: "Roland Garros - Final", teams: "Swiatek vs Sabalenka", date: "12 cze 2026, 15:00", icon: "T", platforms: [{ name: "Eurosport", price: "29.99 zl/msc" }, { name: "TVP Sport", price: "Za darmo" }] },
  { id: 3, event: "GP Monako", teams: "Wyscig glowny", date: "24 maj 2026, 15:00", icon: "R", platforms: [{ name: "Viaplay", price: "34 zl/msc" }] },
  { id: 4, event: "Ekstraklasa 30. kol.", teams: "Lech Poznan vs Legia Warszawa", date: "12 kwi 2026, 17:30", icon: "F", platforms: [{ name: "Canal+", price: "45 zl/msc" }] }
];

const RANKINGS = [
  { rank: 1, title: "Shawshank Redemption", score: 9.3, year: 1994 },
  { rank: 2, title: "The Godfather", score: 9.2, year: 1972 },
  { rank: 3, title: "The Dark Knight", score: 9.0, year: 2008 },
  { rank: 4, title: "Schindler's List", score: 8.9, year: 1993 },
  { rank: 5, title: "Dune: Part Three", score: 8.9, year: 2026 },
  { rank: 6, title: "12 Angry Men", score: 8.9, year: 1957 },
  { rank: 7, title: "Lord of the Rings", score: 8.9, year: 2003 },
  { rank: 8, title: "Pulp Fiction", score: 8.8, year: 1994 }
];

var t = {
  bg: "#0B0F1A",
  s: "#141929",
  sh: "#1C2238",
  a: "#00E5A0",
  ad: "rgba(0,229,160,0.12)",
  tx: "#E8ECF4",
  tm: "#6B7394",
  b: "#1E2540",
  w: "#FFB547",
  d: "#FF4D6A"
};

function App() {
  var screen = useState("home");
  var currentScreen = screen[0];
  var setScreen2 = screen[1];

  var sel = useState(null);
  var selectedMovie = sel[0];
  var setSelectedMovie = sel[1];

  var sq = useState("");
  var searchQuery = sq[0];
  var setSearchQuery = sq[1];

  var sv = useState([]);
  var savedMovies = sv[0];
  var setSavedMovies = sv[1];

  function toggleSaved(id) {
    if (savedMovies.indexOf(id) >= 0) {
      setSavedMovies(savedMovies.filter(function(x) { return x !== id; }));
    } else {
      setSavedMovies(savedMovies.concat([id]));
    }
  }

  function openMovie(movie) {
    setSelectedMovie(movie);
    setScreen2("detail");
  }

  function isSaved(id) {
    return savedMovies.indexOf(id) >= 0;
  }

  var filtered = MOVIES.filter(function(m) {
    var q = searchQuery.toLowerCase();
    return m.title.toLowerCase().indexOf(q) >= 0 || m.genre.toLowerCase().indexOf(q) >= 0;
  });

  // ====== HOME ======
  if (currentScreen === "home") {
    return (
      <div style={{ fontFamily: "Segoe UI, sans-serif", background: t.bg, color: t.tx, minHeight: "100vh", maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>
        <div style={{ padding: "20px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: t.a }}>Where<span style={{ color: t.tx, fontWeight: 400 }}>to</span>Watch</div>
          <span style={{ background: t.ad, color: t.a, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>v0.1 DEMO</span>
        </div>

        <div style={{ padding: "8px 20px 20px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>Znajdz gdzie obejrzec <span style={{ color: t.a }}>cokolwiek chcesz.</span></h2>
          <p style={{ fontSize: 13, color: t.tm, margin: 0 }}>Filmy, seriale i sport - wszystko w jednym miejscu.</p>
        </div>

        <div style={{ padding: "0 20px", marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.tm, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Popularne teraz</div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
            {MOVIES.slice(0, 4).map(function(m) {
              return (
                <div key={m.id} onClick={function() { openMovie(m); }} style={{ minWidth: 110, background: t.s, borderRadius: 14, padding: 12, cursor: "pointer", border: "1px solid " + t.b, textAlign: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: t.ad, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", fontSize: 18, fontWeight: 800, color: t.a }}>{m.poster}</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{m.title}</div>
                  <div style={{ fontSize: 10, color: t.tm }}>{m.year}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ padding: "0 20px", marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.tm, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>IMDb Top</div>
          <div style={{ background: t.s, borderRadius: 14, padding: "4px 16px", border: "1px solid " + t.b }}>
            {RANKINGS.map(function(item) {
              return (
                <div key={item.rank} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: "1px solid " + t.b }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: item.rank <= 3 ? t.a : t.tm, minWidth: 28, textAlign: "center" }}>{item.rank}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: t.tm }}>{item.year}</div>
                  </div>
                  <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: "rgba(255,181,71,0.15)", color: t.w }}>IMDb {item.score}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ padding: "0 20px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.tm, textTransform: "uppercase", letterSpacing: 1.5 }}>Nadchodzace wydarzenia</div>
            <button onClick={function() { setScreen2("sports"); }} style={{ background: "none", border: "none", color: t.a, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Wiecej</button>
          </div>
          {SPORTS.slice(0, 2).map(function(s) {
            return (
              <div key={s.id} style={{ background: t.s, borderRadius: 14, padding: 16, marginBottom: 10, border: "1px solid " + t.b }}>
                <div style={{ fontSize: 11, color: t.a, fontWeight: 700, marginBottom: 2 }}>{s.event}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{s.teams}</div>
                <div style={{ fontSize: 12, color: t.tm, marginBottom: 10 }}>{s.date}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {s.platforms.map(function(p) {
                    return <span key={p.name} style={{ fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 8, background: t.ad, color: p.price === "Za darmo" ? t.a : t.tx }}>{p.name} - {p.price}</span>;
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-around", background: "rgba(11,15,26,0.95)", borderTop: "1px solid " + t.b, padding: "10px 0 14px", zIndex: 100 }}>
          <button onClick={function() { setScreen2("home"); }} style={{ background: "none", border: "none", color: t.a, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>O</span>Odkrywaj</button>
          <button onClick={function() { setScreen2("search"); }} style={{ background: "none", border: "none", color: t.tm, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>S</span>Szukaj</button>
          <button onClick={function() { setScreen2("sports"); }} style={{ background: "none", border: "none", color: t.tm, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>P</span>Sport</button>
          <button onClick={function() { setScreen2("saved"); }} style={{ background: "none", border: "none", color: t.tm, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>L</span>Lista</button>
        </div>
      </div>
    );
  }

  // ====== SEARCH ======
  if (currentScreen === "search") {
    return (
      <div style={{ fontFamily: "Segoe UI, sans-serif", background: t.bg, color: t.tx, minHeight: "100vh", maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>
        <div style={{ padding: "20px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: t.a }}>Where<span style={{ color: t.tx, fontWeight: 400 }}>to</span>Watch</div>
        </div>
        <div style={{ padding: "8px 20px 20px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 16px" }}>Wyszukaj</h2>
          <input
            type="text"
            placeholder="Film, serial, rezyser..."
            value={searchQuery}
            onChange={function(e) { setSearchQuery(e.target.value); }}
            style={{ width: "100%", background: t.s, border: "1.5px solid " + t.b, borderRadius: 14, padding: "14px 16px", color: t.tx, fontSize: 15, outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ padding: "0 20px" }}>
          {filtered.map(function(m) {
            return (
              <div key={m.id} onClick={function() { openMovie(m); }} style={{ background: t.s, borderRadius: 14, padding: 16, marginBottom: 10, cursor: "pointer", border: "1px solid " + t.b }}>
                <div style={{ display: "flex", gap: 14 }}>
                  <div style={{ width: 50, height: 65, background: t.ad, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: t.a }}>{m.poster}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{m.title}</div>
                      <button onClick={function(e) { e.stopPropagation(); toggleSaved(m.id); }} style={{ background: "none", border: "none", color: isSaved(m.id) ? t.a : t.tm, fontSize: 18, cursor: "pointer" }}>{isSaved(m.id) ? "V" : "+"}</button>
                    </div>
                    <div style={{ fontSize: 12, color: t.tm, marginBottom: 6 }}>{m.year} | {m.genre} | {m.duration}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "rgba(255,181,71,0.15)", color: t.w }}>IMDb {m.imdb}</span>
                      <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "rgba(255,77,106,0.15)", color: t.d }}>RT {m.rt}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: t.tm }}>Nie znaleziono wynikow</div>}
        </div>

        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-around", background: "rgba(11,15,26,0.95)", borderTop: "1px solid " + t.b, padding: "10px 0 14px", zIndex: 100 }}>
          <button onClick={function() { setScreen2("home"); }} style={{ background: "none", border: "none", color: t.tm, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>O</span>Odkrywaj</button>
          <button onClick={function() { setScreen2("search"); }} style={{ background: "none", border: "none", color: t.a, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>S</span>Szukaj</button>
          <button onClick={function() { setScreen2("sports"); }} style={{ background: "none", border: "none", color: t.tm, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>P</span>Sport</button>
          <button onClick={function() { setScreen2("saved"); }} style={{ background: "none", border: "none", color: t.tm, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>L</span>Lista</button>
        </div>
      </div>
    );
  }

  // ====== DETAIL ======
  if (currentScreen === "detail" && selectedMovie) {
    var m = selectedMovie;
    return (
      <div style={{ fontFamily: "Segoe UI, sans-serif", background: t.bg, color: t.tx, minHeight: "100vh", maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>
        <div style={{ padding: "20px" }}>
          <button onClick={function() { setScreen2("search"); }} style={{ background: "none", border: "none", color: t.a, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Wroc</button>
        </div>
        <div style={{ margin: "0 20px 20px", background: t.s, borderRadius: 18, padding: "28px 20px", textAlign: "center", border: "1px solid " + t.b }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: t.ad, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 28, fontWeight: 800, color: t.a }}>{m.poster}</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>{m.title}</h1>
          <div style={{ fontSize: 13, color: t.tm }}>{m.year} | {m.genre} | {m.duration}</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
            <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: "rgba(255,181,71,0.15)", color: t.w }}>IMDb {m.imdb}</span>
            <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: "rgba(255,77,106,0.15)", color: t.d }}>RT {m.rt}%</span>
          </div>
        </div>

        <div style={{ padding: "0 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.tm, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Opis</div>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: t.tm, margin: 0 }}>{m.synopsis}</p>
        </div>

        <div style={{ padding: "0 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.tm, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Rezyser</div>
          <p style={{ fontSize: 14, margin: 0 }}>{m.director}</p>
        </div>

        <div style={{ padding: "0 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.tm, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Obsada</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {m.cast.map(function(c) { return <span key={c} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, background: t.ad, color: t.a, fontWeight: 600 }}>{c}</span>; })}
          </div>
        </div>

        <div style={{ padding: "0 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.tm, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Gdzie obejrzec</div>
          {m.platforms.map(function(p) {
            return (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10, background: t.s, border: "1.5px solid " + (p.color || t.b), borderRadius: 12, padding: "12px 16px", marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: p.color || "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>{p.name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: t.tm }}>{p.price}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: t.a, padding: "6px 14px", borderRadius: 8, background: t.ad }}>Ogladaj</span>
              </div>
            );
          })}
        </div>

        <div style={{ padding: "0 20px 20px" }}>
          <button onClick={function() { toggleSaved(m.id); }} style={{ width: "100%", padding: 14, borderRadius: 14, border: "2px solid " + (isSaved(m.id) ? t.a : t.b), background: isSaved(m.id) ? t.ad : t.s, color: isSaved(m.id) ? t.a : t.tx, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {isSaved(m.id) ? "Zapisano na liscie" : "Dodaj do mojej listy"}
          </button>
        </div>

        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-around", background: "rgba(11,15,26,0.95)", borderTop: "1px solid " + t.b, padding: "10px 0 14px", zIndex: 100 }}>
          <button onClick={function() { setScreen2("home"); }} style={{ background: "none", border: "none", color: t.tm, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>O</span>Odkrywaj</button>
          <button onClick={function() { setScreen2("search"); }} style={{ background: "none", border: "none", color: t.a, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>S</span>Szukaj</button>
          <button onClick={function() { setScreen2("sports"); }} style={{ background: "none", border: "none", color: t.tm, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>P</span>Sport</button>
          <button onClick={function() { setScreen2("saved"); }} style={{ background: "none", border: "none", color: t.tm, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>L</span>Lista</button>
        </div>
      </div>
    );
  }

  // ====== SPORTS ======
  if (currentScreen === "sports") {
    return (
      <div style={{ fontFamily: "Segoe UI, sans-serif", background: t.bg, color: t.tx, minHeight: "100vh", maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>
        <div style={{ padding: "20px 20px 12px" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: t.a }}>Where<span style={{ color: t.tx, fontWeight: 400 }}>to</span>Watch</div>
        </div>
        <div style={{ padding: "8px 20px 16px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}><span style={{ color: t.a }}>|</span> Sport na zywo</h2>
        </div>
        <div style={{ padding: "0 20px" }}>
          {SPORTS.map(function(s) {
            return (
              <div key={s.id} style={{ background: t.s, borderRadius: 14, padding: 16, marginBottom: 10, border: "1px solid " + t.b }}>
                <div style={{ fontSize: 11, color: t.a, fontWeight: 700, marginBottom: 2 }}>{s.event}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{s.teams}</div>
                <div style={{ fontSize: 12, color: t.tm, marginBottom: 10 }}>{s.date}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {s.platforms.map(function(p) {
                    return <span key={p.name} style={{ fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 8, background: t.ad, color: p.price === "Za darmo" ? t.a : t.tx }}>{p.name} - {p.price}</span>;
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-around", background: "rgba(11,15,26,0.95)", borderTop: "1px solid " + t.b, padding: "10px 0 14px", zIndex: 100 }}>
          <button onClick={function() { setScreen2("home"); }} style={{ background: "none", border: "none", color: t.tm, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>O</span>Odkrywaj</button>
          <button onClick={function() { setScreen2("search"); }} style={{ background: "none", border: "none", color: t.tm, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>S</span>Szukaj</button>
          <button onClick={function() { setScreen2("sports"); }} style={{ background: "none", border: "none", color: t.a, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>P</span>Sport</button>
          <button onClick={function() { setScreen2("saved"); }} style={{ background: "none", border: "none", color: t.tm, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>L</span>Lista</button>
        </div>
      </div>
    );
  }

  // ====== SAVED ======
  var savedList = MOVIES.filter(function(m) { return savedMovies.indexOf(m.id) >= 0; });
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", background: t.bg, color: t.tx, minHeight: "100vh", maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>
      <div style={{ padding: "20px 20px 12px" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: t.a }}>Where<span style={{ color: t.tx, fontWeight: 400 }}>to</span>Watch</div>
      </div>
      <div style={{ padding: "8px 20px 16px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Moja lista</h2>
      </div>
      <div style={{ padding: "0 20px" }}>
        {savedList.length > 0 ? savedList.map(function(m) {
          return (
            <div key={m.id} onClick={function() { openMovie(m); }} style={{ background: t.s, borderRadius: 14, padding: 16, marginBottom: 10, cursor: "pointer", border: "1px solid " + t.b }}>
              <div style={{ display: "flex", gap: 14 }}>
                <div style={{ width: 50, height: 65, background: t.ad, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: t.a }}>{m.poster}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: t.tm }}>{m.year} | {m.genre}</div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div style={{ textAlign: "center", padding: 60, color: t.tm }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>+</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Twoja lista jest pusta</div>
            <div style={{ fontSize: 13 }}>Dodaj filmy klikajac + przy tytule</div>
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-around", background: "rgba(11,15,26,0.95)", borderTop: "1px solid " + t.b, padding: "10px 0 14px", zIndex: 100 }}>
        <button onClick={function() { setScreen2("home"); }} style={{ background: "none", border: "none", color: t.tm, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>O</span>Odkrywaj</button>
        <button onClick={function() { setScreen2("search"); }} style={{ background: "none", border: "none", color: t.tm, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>S</span>Szukaj</button>
        <button onClick={function() { setScreen2("sports"); }} style={{ background: "none", border: "none", color: t.tm, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>P</span>Sport</button>
        <button onClick={function() { setScreen2("saved"); }} style={{ background: "none", border: "none", color: t.a, fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}><span style={{ fontSize: 18 }}>L</span>Lista</button>
      </div>
    </div>
  );
}

export default App;