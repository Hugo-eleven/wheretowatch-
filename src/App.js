import { useState, useEffect } from "react";
import { t } from "./theme";
import { SPORTS_EVENTS, DISCIPLINES, filterByDiscipline } from "./services/sports";
import {
  fetchPopular, fetchTopRated, searchMulti,
  fetchDetails, fetchProviders, fetchCredits, fetchSimilar, fetchRecommendations,
  fetchTrendingMovies, fetchTrendingTV, fetchUpcoming,
  fetchEpisodes, fetchExternalIds, fetchVideos, LOGO_URL,
} from "./services/tmdb";
import { fetchOMDbRatings } from "./services/omdb";
import { supabase, loadSavedFromSupabase, addSavedToSupabase, removeSavedFromSupabase } from "./services/supabase";
import { Navigation } from "./components/Navigation";
import { MovieCard } from "./components/MovieCard";
import { SportCard } from "./components/SportCard";
import { RankingCard } from "./components/RankingCard";
import { AuthModal } from "./components/Auth";

const PLATFORM_PRICES = {
  "Netflix": "33 zł/msc",
  "Canal+": "45 zł/msc",
  "Apple TV+": "34.99 zł/msc",
  "Disney+": "37.99 zł/msc",
  "Max": "29.99 zł/msc",
  "SkyShowtime": "19.99 zł/msc",
  "Amazon Prime Video": "49 zł/rok",
  "Amazon Prime": "49 zł/rok",
  "Viaplay": "34 zł/msc",
  "Eurosport Player": "29.99 zł/msc",
  "TVP VOD": "Za darmo",
};

const WRAP = {
  fontFamily: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif",
  background: t.bg,
  color: t.tx,
  minHeight: "100vh",
  maxWidth: 960,
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

function ThemeToggle({ darkMode, toggle }) {
  return (
    <button
      onClick={toggle}
      style={{
        background: t.ad, border: "1px solid " + t.ab,
        borderRadius: 20, color: t.a, fontSize: 16,
        cursor: "pointer", padding: "4px 12px",
        transition: "all 0.15s",
      }}
      title={darkMode ? "Jasny motyw" : "Ciemny motyw"}
    >
      {darkMode ? "☀️" : "🌙"}
    </button>
  );
}

function SectionHeader({ children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      fontSize: 11, fontWeight: 800, color: t.tm,
      textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12,
    }}>
      <div style={{ width: 3, height: 14, borderRadius: 2, background: t.a }} />
      {children}
    </div>
  );
}

function SkeletonCompact() {
  return (
    <div style={{
      minWidth: 130, borderRadius: 18, overflow: "hidden",
      flexShrink: 0, border: "1px solid " + t.b, background: t.s,
    }}>
      <div className="skeleton" style={{ width: "100%", height: 160, borderRadius: 0 }} />
      <div style={{ padding: "10px 12px 14px" }}>
        <div className="skeleton" style={{ height: 12, borderRadius: 4, marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 10, borderRadius: 4, width: "60%" }} />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: t.s, borderRadius: 18, padding: 14,
      marginBottom: 10, border: "1px solid " + t.b,
    }}>
      <div style={{ display: "flex", gap: 14 }}>
        <div className="skeleton" style={{ width: 58, height: 80, borderRadius: 12, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 15, borderRadius: 4, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 11, borderRadius: 4, width: "70%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 22, borderRadius: 8, width: 60 }} />
        </div>
      </div>
    </div>
  );
}

function SkeletonRankingItem({ isLast }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 16px",
      borderBottom: isLast ? "none" : "1px solid " + t.b,
    }}>
      <div className="skeleton" style={{ width: 30, height: 18, borderRadius: 4, flexShrink: 0 }} />
      <div className="skeleton" style={{ width: 32, height: 44, borderRadius: 6, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 13, borderRadius: 4, marginBottom: 5 }} />
        <div className="skeleton" style={{ height: 10, borderRadius: 4, width: "40%" }} />
      </div>
      <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 8, flexShrink: 0 }} />
    </div>
  );
}

function ErrorMsg({ msg }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: t.tm }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: t.d, marginBottom: 4 }}>Błąd połączenia</div>
      <div style={{ fontSize: 12 }}>{msg}</div>
    </div>
  );
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  if (diff <= 0) return "Już dostępne";
  if (diff === 1) return "Jutro";
  return `za ${diff} dni`;
}

function TopTenCard({ movie, rank, onOpen }) {
  return (
    <div
      onClick={() => onOpen(movie)}
      className="compact-card-hover"
      style={{
        position: "relative", cursor: "pointer",
        minWidth: 130, flexShrink: 0,
        paddingLeft: rank >= 10 ? 30 : 24,
        paddingBottom: 12,
      }}
    >
      {/* Number Netflix-style */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, zIndex: 2,
        fontSize: 86, fontWeight: 800, lineHeight: 1,
        color: t.bg,
        WebkitTextStroke: "3px " + t.tm,
        userSelect: "none",
        letterSpacing: -4,
      }}>
        {rank}
      </div>
      {/* Poster */}
      <div style={{
        width: 120, height: 168, borderRadius: 14,
        overflow: "hidden", background: t.ad,
        position: "relative", zIndex: 1,
        boxShadow: "0 4px 20px rgba(0,0,0,0.45)",
      }}>
        {movie.poster ? (
          <img src={movie.poster} alt="" loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 36 }}>🎬</div>
        )}
      </div>
    </div>
  );
}

function UpcomingCard({ movie, onOpen }) {
  const days = daysUntil(movie.releaseDate);
  const dateFormatted = movie.releaseDate
    ? movie.releaseDate.split("-").reverse().join(".")
    : null;
  return (
    <div
      onClick={() => onOpen(movie)}
      className="compact-card-hover"
      style={{ minWidth: 140, flexShrink: 0, cursor: "pointer" }}
    >
      <div style={{
        width: "100%", height: 196, borderRadius: 16, overflow: "hidden",
        background: t.ad, position: "relative",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)", marginBottom: 8,
      }}>
        {movie.poster ? (
          <img src={movie.poster} alt="" loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 36 }}>🎬</div>
        )}
        {days && (
          <div style={{
            position: "absolute", top: 8, right: 8,
            background: t.a, color: "#0B0F1A",
            fontSize: 9, fontWeight: 800, borderRadius: 8,
            padding: "3px 7px",
          }}>
            {days}
          </div>
        )}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3, marginBottom: 2, color: t.tx }}>
        {movie.title}
      </div>
      {dateFormatted && (
        <div style={{ fontSize: 10, color: t.tm }}>{dateFormatted}</div>
      )}
    </div>
  );
}

function SplashScreen({ onDone }) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#0B0F1A",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 32, textAlign: "center",
    }}>
      <div style={{ fontSize: 52, fontWeight: 800, color: "#00E5A0", marginBottom: 6, letterSpacing: -1 }}>
        Where<span style={{ color: "#E8ECF4", fontWeight: 400 }}>to</span>Watch
      </div>
      <div style={{ fontSize: 15, color: "#6B7394", marginBottom: 52, lineHeight: 1.65, maxWidth: 280 }}>
        Znajdź gdzie obejrzeć filmy, seriale i sport w Polsce
      </div>
      <button
        onClick={onDone}
        style={{
          background: "#00E5A0", border: "none",
          borderRadius: 16, color: "#0B0F1A",
          fontSize: 16, fontWeight: 800,
          cursor: "pointer", padding: "14px 44px",
          boxShadow: "0 4px 24px rgba(0,229,160,0.35)",
        }}
      >
        Zaczynajmy
      </button>
    </div>
  );
}

function HeroBanner({ movies, index, setIndex, onOpen }) {
  const movie = movies[index];
  if (!movie?.backdrop) return null;
  return (
    <div style={{ position: "relative", width: "100%", height: 300, overflow: "hidden", marginBottom: 28 }}>
      <img
        src={movie.backdrop}
        alt={movie.title}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      {/* gradient bottom */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(11,15,26,1) 0%, rgba(11,15,26,0.55) 55%, transparent 100%)",
      }} />
      {/* content */}
      <div style={{ position: "absolute", bottom: 44, left: 24, right: 24 }}>
        <div style={{ fontSize: 23, fontWeight: 800, color: "#E8ECF4", marginBottom: 6, lineHeight: 1.2, textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
          {movie.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          {movie.imdb && (
            <span style={{ fontSize: 12, fontWeight: 700, color: "#FFB547" }}>⭐ {movie.imdb}</span>
          )}
          <span style={{ fontSize: 12, color: "rgba(232,236,244,0.65)" }}>
            {[movie.year, movie.genre].filter(Boolean).join(" · ")}
          </span>
        </div>
        <button
          onClick={() => onOpen(movie)}
          style={{
            background: "#00E5A0", border: "none",
            borderRadius: 12, color: "#0B0F1A",
            fontSize: 13, fontWeight: 800,
            cursor: "pointer", padding: "9px 24px",
            boxShadow: "0 2px 16px rgba(0,229,160,0.3)",
          }}
        >
          Szczegóły
        </button>
      </div>
      {/* dots */}
      <div style={{
        position: "absolute", bottom: 16, left: 0, right: 0,
        display: "flex", justifyContent: "center", gap: 6,
      }}>
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`hero-dot${i === index ? " active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState("home");
  const [prevScreen, setPrevScreen] = useState("home");

  // Dane z API
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [savedMovies, setSavedMovies] = useState(() => {
    try {
      const stored = localStorage.getItem("wtw_saved");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  // Mapuje id → mediaType żeby wiedzieć jak fetch'ować szczegóły zapisanego tytułu
  const [savedMediaTypes, setSavedMediaTypes] = useState(() => {
    try {
      const stored = localStorage.getItem("wtw_saved_types");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Detail
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedProviders, setSelectedProviders] = useState(null);
  const [selectedCredits, setSelectedCredits] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [ratings, setRatings] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);

  // Sport
  const [sportsDiscipline, setSportsDiscipline] = useState("all");

  // Filtr wyszukiwarki
  const [searchFilter, setSearchFilter] = useState("all");

  // Rankingi
  const [rankingTab, setRankingTab] = useState("top_rated");

  // Sezony / odcinki (TV)
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [episodeSort, setEpisodeSort] = useState("number");
  const [episodesLoading, setEpisodesLoading] = useState(false);

  // Stan ładowania
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Tryb jasny/ciemny
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("wtw_theme") !== "light"; }
    catch { return true; }
  });

  // Splash screen
  const [splashDone, setSplashDone] = useState(() => {
    try { return localStorage.getItem("wtw_splash") === "1"; }
    catch { return false; }
  });

  // Hero banner auto-rotation
  const [heroBannerIndex, setHeroBannerIndex] = useState(0);

  // Top 10 + Upcoming
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);

  // Label "Podobne" vs "Rekomendowane"
  const [similarLabel, setSimilarLabel] = useState("Podobne filmy");

  // Auth
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  // Cache szczegółów filmów spoza popularMovies/searchResults
  const [savedMoviesCache, setSavedMoviesCache] = useState({});
  const [savedCacheLoading, setSavedCacheLoading] = useState(false);

  // Porównywarka subskrypcji
  const [savedProvidersMap, setSavedProvidersMap] = useState({});
  const [savedProvidersLoading, setSavedProvidersLoading] = useState(false);

  // Sync motywu z DOM + localStorage
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("wtw_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(d => !d);

  // Zapisuj ulubione do localStorage przy każdej zmianie
  useEffect(() => {
    localStorage.setItem("wtw_saved", JSON.stringify(savedMovies));
  }, [savedMovies]);

  useEffect(() => {
    localStorage.setItem("wtw_saved_types", JSON.stringify(savedMediaTypes));
  }, [savedMediaTypes]);

  // Ładuj wszystkie dane startowe
  useEffect(() => {
    Promise.all([
      fetchPopular(),
      fetchTopRated(),
      fetchTrendingMovies().catch(() => []),
      fetchTrendingTV().catch(() => []),
      fetchUpcoming().catch(() => []),
    ]).then(([popular, topRated, trending, trendTV, upcoming]) => {
      setPopularMovies(popular);
      setTopRatedMovies(topRated);
      setTrendingMovies(trending);
      setTrendingTV(trendTV);
      setUpcomingMovies(upcoming);
      setHomeLoading(false);
    }).catch(err => {
      setHomeError(err.message);
      setHomeLoading(false);
    });
  }, []);

  // Supabase auth
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) setUser(data.session.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Ładuj ulubione z Supabase po zalogowaniu
  useEffect(() => {
    if (!user) return;
    loadSavedFromSupabase(user.id).then(result => {
      if (!result) return;
      setSavedMovies(result.ids);
      setSavedMediaTypes(result.types);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Auto-rotacja hero banner co 6 sekund
  useEffect(() => {
    if (popularMovies.length === 0) return;
    const timer = setInterval(() => {
      setHeroBannerIndex(i => (i + 1) % Math.min(5, popularMovies.length));
    }, 6000);
    return () => clearInterval(timer);
  }, [popularMovies.length]);

  // Wyszukiwanie z debounce 400ms
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(() => {
      searchMulti(searchQuery)
        .then(setSearchResults)
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Pobieranie szczegółów filmów zapisanych w poprzednich sesjach (nie ma ich w popularMovies/searchResults)
  useEffect(() => {
    if (screen !== "saved") return;
    const loadedIds = new Set([...popularMovies, ...searchResults].map(m => m.id));
    const missingIds = savedMovies.filter(id => !loadedIds.has(id) && !(id in savedMoviesCache));
    if (missingIds.length === 0) return;

    setSavedCacheLoading(true);
    Promise.all(
      missingIds.map(id =>
        fetchDetails(id, savedMediaTypes[id] ?? "movie")
          .catch(() => null)
          .then(details => ({ id, details }))
      )
    ).then(results => {
      setSavedMoviesCache(prev => {
        const next = { ...prev };
        results.forEach(({ id, details }) => { if (details) next[id] = details; });
        return next;
      });
      setSavedCacheLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, savedMovies.length, popularMovies.length, searchResults.length]);

  // Pobieranie dostawców dla zapisanych filmów (porównywarka subskrypcji)
  useEffect(() => {
    if (screen !== "saved") return;
    const allKnown = [...popularMovies, ...searchResults, ...Object.values(savedMoviesCache)];
    const currentSavedList = allKnown.filter(
      (m, i, arr) => savedMovies.includes(m.id) && arr.findIndex(x => x.id === m.id) === i
    );
    const needProviders = currentSavedList.filter(m => !(m.id in savedProvidersMap));
    if (needProviders.length === 0) return;

    setSavedProvidersLoading(true);
    Promise.all(
      needProviders.map(m =>
        fetchProviders(m.id, m.mediaType ?? "movie")
          .then(p => ({ id: m.id, p }))
          .catch(() => ({ id: m.id, p: null }))
      )
    ).then(results => {
      setSavedProvidersMap(prev => {
        const next = { ...prev };
        results.forEach(({ id, p }) => { next[id] = p; });
        return next;
      });
      setSavedProvidersLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, savedMovies.length, popularMovies.length, searchResults.length, Object.keys(savedMoviesCache).length]);

  async function openMovie(movie, from) {
    setPrevScreen(from || screen);
    setSelectedMovie(movie);
    setSelectedProviders(null);
    setSelectedCredits([]);
    setSimilarMovies([]);
    setRatings(null);
    setTrailerKey(null);
    setSelectedSeason(null);
    setEpisodes([]);
    setDetailLoading(true);
    setScreen("detail");

    try {
      const mediaType = movie.mediaType ?? "movie";
      const [details, providers, credits, similar, videoKey] = await Promise.all([
        fetchDetails(movie.id, mediaType),
        fetchProviders(movie.id, mediaType),
        fetchCredits(movie.id, mediaType),
        fetchSimilar(movie.id, mediaType),
        fetchVideos(movie.id, mediaType),
      ]);
      setSelectedMovie(details);
      setSelectedProviders(providers);
      setSelectedCredits(credits);
      setTrailerKey(videoKey);

      // Filtruj podobne po ocenie > 6.0, sortuj po popularności (malejąco)
      const goodSimilar = similar
        .filter(m => (m.imdb ?? 0) >= 6.0)
        .sort((a, b) => (b.imdb ?? 0) - (a.imdb ?? 0));
      if (goodSimilar.length >= 3) {
        setSimilarMovies(goodSimilar);
        setSimilarLabel("Podobne filmy");
      } else {
        try {
          const recs = await fetchRecommendations(movie.id, mediaType);
          const goodRecs = recs.filter(m => (m.imdb ?? 0) >= 6.0);
          setSimilarMovies(goodRecs.length > 0 ? goodRecs : goodSimilar);
          setSimilarLabel("Rekomendowane");
        } catch {
          setSimilarMovies(goodSimilar);
          setSimilarLabel("Podobne filmy");
        }
      }

      const imdbId = await fetchExternalIds(movie.id, mediaType);
      if (imdbId) {
        const omdb = await fetchOMDbRatings(imdbId);
        setRatings(omdb);
      }
    } catch (e) {
      // Zostaw to co mamy z listy
    } finally {
      setDetailLoading(false);
    }
  }

  function toggleSaved(id, mediaType = "movie") {
    setSavedMovies(prev => {
      const removing = prev.includes(id);
      if (!removing) setSavedMediaTypes(mt => ({ ...mt, [id]: mediaType }));
      if (user) {
        if (removing) removeSavedFromSupabase(user.id, id);
        else addSavedToSupabase(user.id, id, mediaType);
      }
      return removing ? prev.filter(x => x !== id) : [...prev, id];
    });
  }

  async function openSeason(seasonNumber) {
    if (selectedSeason === seasonNumber) {
      setSelectedSeason(null);
      setEpisodes([]);
      return;
    }
    setSelectedSeason(seasonNumber);
    setEpisodes([]);
    setEpisodesLoading(true);
    try {
      const eps = await fetchEpisodes(selectedMovie.id, seasonNumber);
      setEpisodes(eps);
    } catch (e) {
      setEpisodes([]);
    } finally {
      setEpisodesLoading(false);
    }
  }

  const isSaved = id => savedMovies.includes(id);

  // ====== SPLASH ======
  if (!splashDone) {
    return (
      <SplashScreen onDone={() => {
        try { localStorage.setItem("wtw_splash", "1"); } catch {}
        setSplashDone(true);
      }} />
    );
  }

  // ====== HOME ======
  if (screen === "home") {
    return (
      <div style={WRAP}>
        <div style={{ padding: "22px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {user ? (
              <button
                onClick={() => { if (supabase) supabase.auth.signOut().then(() => setUser(null)); }}
                title={user.email}
                style={{
                  width: 34, height: 34, borderRadius: 17,
                  background: t.a, border: "none", color: "#0B0F1A",
                  fontSize: 13, fontWeight: 800, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {(user.email?.[0] ?? "U").toUpperCase()}
              </button>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                style={{
                  background: t.ad, border: "1.5px solid " + t.ab,
                  borderRadius: 20, color: t.a,
                  fontSize: 11, fontWeight: 700,
                  cursor: "pointer", padding: "5px 13px",
                }}
              >
                Zaloguj się
              </button>
            )}
            <ThemeToggle darkMode={darkMode} toggle={toggleTheme} />
          </div>
        </div>

        {/* Hero Banner */}
        {!homeLoading && !homeError && (
          <HeroBanner
            movies={popularMovies.slice(0, 5)}
            index={heroBannerIndex}
            setIndex={setHeroBannerIndex}
            onOpen={openMovie}
          />
        )}

        {homeError ? (
          <ErrorMsg msg={homeError} />
        ) : homeLoading ? (
          <>
            <div style={{ padding: "0 20px", marginBottom: 28 }}>
              <SectionHeader>Popularne teraz</SectionHeader>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                {[...Array(5)].map((_, i) => <SkeletonCompact key={i} />)}
              </div>
            </div>
            <div style={{ padding: "0 20px", marginBottom: 28 }}>
              <SectionHeader>Najwyżej oceniane</SectionHeader>
              <div style={{
                background: t.s, borderRadius: 18,
                border: "1px solid " + t.b, overflow: "hidden",
              }}>
                {[...Array(8)].map((_, i) => <SkeletonRankingItem key={i} isLast={i === 7} />)}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Popularne teraz */}
            <div style={{ padding: "0 20px", marginBottom: 28 }}>
              <SectionHeader>Popularne teraz</SectionHeader>
              <div className="carousel-desktop" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, scrollBehavior: "smooth" }}>
                {popularMovies.slice(0, 10).map(m => (
                  <MovieCard key={m.id} movie={m} onOpen={openMovie} compact />
                ))}
              </div>
            </div>

            {/* Ranking z tabami */}
            <div style={{ padding: "0 20px", marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <SectionHeader>{rankingTab === "top_rated" ? "Najwyżej oceniane" : "Popularne teraz"}</SectionHeader>
                <div style={{ display: "flex", gap: 6 }}>
                  {[{ id: "top_rated", label: "TMDB Top" }, { id: "popular", label: "Popularne" }].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setRankingTab(tab.id)}
                      style={{
                        padding: "5px 12px", borderRadius: 16, cursor: "pointer",
                        border: "1.5px solid " + (rankingTab === tab.id ? t.a : t.b),
                        background: rankingTab === tab.id ? t.ad : t.s,
                        color: rankingTab === tab.id ? t.a : t.tm,
                        fontSize: 11, fontWeight: 700,
                        transition: "all 0.15s",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{
                background: t.s, borderRadius: 18,
                border: "1px solid " + t.b, overflow: "hidden",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              }}>
                {(rankingTab === "top_rated" ? topRatedMovies : popularMovies).slice(0, 8).map((item, i) => (
                  <RankingCard
                    key={item.id}
                    item={item}
                    rank={i + 1}
                    isLast={i === 7}
                    onOpen={openMovie}
                  />
                ))}
              </div>
            </div>

            {/* Top 10 Filmów */}
            {trendingMovies.length > 0 && (
              <div style={{ padding: "0 20px", marginBottom: 28 }}>
                <SectionHeader>Top 10 Filmów w Polsce</SectionHeader>
                <div style={{ display: "flex", gap: 0, overflowX: "auto", paddingBottom: 8, scrollBehavior: "smooth" }}>
                  {trendingMovies.map((m, i) => (
                    <TopTenCard key={m.id} movie={m} rank={i + 1} onOpen={openMovie} />
                  ))}
                </div>
              </div>
            )}

            {/* Top 10 Seriali */}
            {trendingTV.length > 0 && (
              <div style={{ padding: "0 20px", marginBottom: 28 }}>
                <SectionHeader>Top 10 Seriali w Polsce</SectionHeader>
                <div style={{ display: "flex", gap: 0, overflowX: "auto", paddingBottom: 8, scrollBehavior: "smooth" }}>
                  {trendingTV.map((m, i) => (
                    <TopTenCard key={m.id} movie={m} rank={i + 1} onOpen={openMovie} />
                  ))}
                </div>
              </div>
            )}

            {/* Wkrótce w kinach */}
            {upcomingMovies.length > 0 && (
              <div style={{ padding: "0 20px", marginBottom: 28 }}>
                <SectionHeader>Wkrótce w kinach</SectionHeader>
                <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4, scrollBehavior: "smooth" }}>
                  {upcomingMovies.map(m => (
                    <UpcomingCard key={m.id} movie={m} onOpen={openMovie} />
                  ))}
                </div>
              </div>
            )}

            {/* Sport */}
            <div style={{ padding: "0 20px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <SectionHeader>Nadchodzące transmisje</SectionHeader>
                <button
                  onClick={() => setScreen("sports")}
                  style={{ background: "none", border: "none", color: t.a, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}
                >
                  Więcej →
                </button>
              </div>
              {SPORTS_EVENTS.slice(0, 3).map(s => <SportCard key={s.id} sport={s} />)}
            </div>
          </>
        )}

        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onAuth={u => { setUser(u); setShowAuth(false); }}
          />
        )}
        <Navigation screen={screen} setScreen={setScreen} />
      </div>
    );
  }

  // ====== SEARCH ======
  if (screen === "search") {
    const SEARCH_FILTERS = [
      { id: "all", label: "Wszystko" },
      { id: "movie", label: "🎬 Filmy" },
      { id: "tv", label: "📺 Seriale" },
    ];
    const visibleResults = searchFilter === "all"
      ? searchResults
      : searchResults.filter(m => m.mediaType === searchFilter);

    return (
      <div style={WRAP}>
        <div style={{ padding: "22px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {user ? (
              <button
                onClick={() => { if (supabase) supabase.auth.signOut().then(() => setUser(null)); }}
                title={user.email}
                style={{
                  width: 34, height: 34, borderRadius: 17,
                  background: t.a, border: "none", color: "#0B0F1A",
                  fontSize: 13, fontWeight: 800, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {(user.email?.[0] ?? "U").toUpperCase()}
              </button>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                style={{
                  background: t.ad, border: "1.5px solid " + t.ab,
                  borderRadius: 20, color: t.a,
                  fontSize: 11, fontWeight: 700,
                  cursor: "pointer", padding: "5px 13px",
                }}
              >
                Zaloguj się
              </button>
            )}
            <ThemeToggle darkMode={darkMode} toggle={toggleTheme} />
          </div>
        </div>
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onAuth={u => { setUser(u); setShowAuth(false); }}
          />
        )}
        <div style={{ padding: "8px 20px 12px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 16px" }}>Wyszukaj</h2>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: 14, top: "50%",
              transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none",
            }}>🔍</span>
            <input
              type="text"
              placeholder="Tytuł, gatunek..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%", background: t.s,
                border: "1.5px solid " + (searchQuery ? t.a : t.b),
                borderRadius: 14, padding: "14px 16px 14px 44px",
                color: t.tx, fontSize: 15, outline: "none",
                boxSizing: "border-box", transition: "border-color 0.15s",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {SEARCH_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setSearchFilter(f.id)}
                style={{
                  padding: "7px 16px", borderRadius: 20, cursor: "pointer",
                  border: "1.5px solid " + (searchFilter === f.id ? t.a : t.b),
                  background: searchFilter === f.id ? t.ad : t.s,
                  color: searchFilter === f.id ? t.a : t.tm,
                  fontSize: 12, fontWeight: 700,
                  transition: "all 0.15s",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "0 20px" }}>
          {searchLoading ? (
            <div className="search-results-grid">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : visibleResults.length > 0 ? (
            <div className="search-results-grid">
              {visibleResults.map(m => (
                <MovieCard
                  key={m.id} movie={m}
                  onOpen={openMovie}
                  onToggleSaved={toggleSaved}
                  saved={isSaved(m.id)}
                />
              ))}
            </div>
          ) : searchQuery.trim() ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: t.tm }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Brak wyników</div>
              <div style={{ fontSize: 13 }}>Spróbuj innej frazy</div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: t.tm }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 13 }}>Wpisz tytuł lub gatunek</div>
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
    const providerGroups = [
      { label: "Streaming", icon: "📺", items: selectedProviders?.flatrate ?? [] },
      { label: "Wypożyczenie", icon: "🎬", items: selectedProviders?.rent ?? [] },
      { label: "Zakup", icon: "🛒", items: selectedProviders?.buy ?? [] },
    ].filter(g => g.items.length > 0);

    return (
      <div style={WRAP}>
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => setScreen(prevScreen)}
            style={{
              background: t.s, border: "1px solid " + t.b,
              borderRadius: 10, color: t.a, fontSize: 13,
              fontWeight: 700, cursor: "pointer", padding: "7px 14px",
              transition: "all 0.15s",
            }}
          >
            ← Wróć
          </button>
          <ThemeToggle darkMode={darkMode} toggle={toggleTheme} />
        </div>

        {/* Hero */}
        <div style={{ margin: "0 20px 24px" }}>
          <div style={{
            background: t.s, borderRadius: 22,
            border: "1px solid " + t.b,
            boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
            overflow: "hidden",
          }}>
            {m.poster ? (
              <div style={{ position: "relative" }}>
                <img
                  src={m.poster}
                  alt={m.title}
                  loading="lazy"
                  style={{ width: "100%", maxHeight: 300, objectFit: "cover", display: "block" }}
                />
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(transparent, var(--t-hero-grad))",
                  padding: "60px 20px 20px",
                }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", lineHeight: 1.2 }}>
                    {m.title}
                  </h1>
                  <div style={{ fontSize: 13, color: t.tm }}>
                    {[m.year, m.genre, m.duration].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: "28px 20px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 60, marginBottom: 12 }}>🎬</div>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>{m.title}</h1>
                <div style={{ fontSize: 13, color: t.tm }}>
                  {[m.year, m.genre, m.duration].filter(Boolean).join(" · ")}
                </div>
              </div>
            )}
            {(m.imdb || ratings?.imdb || ratings?.rottenTomatoes) && (
              <div style={{ padding: "14px 20px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {m.imdb && (
                  <span style={{
                    padding: "5px 12px", borderRadius: 10, fontSize: 12,
                    fontWeight: 700, background: t.ad, color: t.a,
                    border: "1px solid " + t.ab,
                  }}>
                    ⭐ {m.imdb} TMDB
                  </span>
                )}
                {ratings?.imdb && (
                  <span style={{
                    padding: "5px 12px", borderRadius: 10, fontSize: 12,
                    fontWeight: 700, background: t.wa, color: t.w,
                  }}>
                    ⭐ {ratings.imdb} IMDb
                  </span>
                )}
                {ratings?.rottenTomatoes && (
                  <span style={{
                    padding: "5px 12px", borderRadius: 10, fontSize: 12,
                    fontWeight: 700, background: t.da, color: t.d,
                    border: "1px solid " + t.d,
                  }}>
                    🍅 {ratings.rottenTomatoes}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "0 20px" }}>
          {/* Trailer YouTube */}
          {trailerKey && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader>Trailer</SectionHeader>
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}`}
                style={{
                  width: "100%", height: 220, border: "none",
                  borderRadius: 14, display: "block",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Trailer"
              />
            </div>
          )}

          {/* Szczegóły serialu */}
          {m.mediaType === "tv" && (m.seasons || m.episodes) && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader>Szczegóły serialu</SectionHeader>
              <div style={{ display: "flex", gap: 10 }}>
                {m.seasons != null && (
                  <div style={{
                    flex: 1, background: t.s, borderRadius: 14,
                    border: "1px solid " + t.b, padding: "14px 12px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: t.a }}>{m.seasons}</div>
                    <div style={{ fontSize: 11, color: t.tm, marginTop: 3 }}>
                      {m.seasons === 1 ? "Sezon" : m.seasons < 5 ? "Sezony" : "Sezonów"}
                    </div>
                  </div>
                )}
                {m.episodes != null && (
                  <div style={{
                    flex: 1, background: t.s, borderRadius: 14,
                    border: "1px solid " + t.b, padding: "14px 12px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: t.a }}>{m.episodes}</div>
                    <div style={{ fontSize: 11, color: t.tm, marginTop: 3 }}>Odcinków</div>
                  </div>
                )}
                {m.status != null && (
                  <div style={{
                    flex: 1, background: t.s, borderRadius: 14,
                    border: "1px solid " + t.b, padding: "14px 12px", textAlign: "center",
                  }}>
                    <div style={{
                      fontSize: 11, fontWeight: 800,
                      color: m.status === "Ended" ? t.tm : t.a,
                      lineHeight: 1.4,
                    }}>
                      {m.status === "Ended" ? "Zakończony"
                        : m.status === "Returning Series" ? "W toku"
                        : m.status === "Canceled" ? "Anulowany"
                        : m.status}
                    </div>
                    <div style={{ fontSize: 11, color: t.tm, marginTop: 3 }}>Status</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista sezonów */}
          {m.mediaType === "tv" && m.seasonsList?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader>Sezony</SectionHeader>
              {m.seasonsList.map(season => {
                const isOpen = selectedSeason === season.number;
                const sortedEps = episodeSort === "rating"
                  ? [...episodes].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
                  : [...episodes].sort((a, b) => a.number - b.number);
                return (
                  <div key={season.number}>
                    <div
                      onClick={() => openSeason(season.number)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        background: isOpen ? t.ad : t.s,
                        border: "1.5px solid " + (isOpen ? t.ab : t.b),
                        borderRadius: 14, padding: "11px 14px", marginBottom: 8,
                        cursor: "pointer",
                      }}
                    >
                      {season.poster ? (
                        <img
                          src={season.poster.replace("/w500", "/w92")}
                          alt=""
                          loading="lazy"
                          style={{ width: 32, height: 44, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{
                          width: 32, height: 44, borderRadius: 6, flexShrink: 0,
                          background: t.sh, display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 16,
                        }}>📺</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isOpen ? t.a : t.tx }}>
                          {season.name}
                        </div>
                        <div style={{ fontSize: 11, color: t.tm, marginTop: 2 }}>
                          {[season.airDate, season.episodeCount ? `${season.episodeCount} odcinków` : null].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: t.tm }}>{isOpen ? "▲" : "▼"}</span>
                    </div>

                    {isOpen && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                          {[{ id: "number", label: "Kolejność" }, { id: "rating", label: "Ocena ↓" }].map(mode => (
                            <button
                              key={mode.id}
                              onClick={() => setEpisodeSort(mode.id)}
                              style={{
                                padding: "5px 12px", borderRadius: 16, cursor: "pointer",
                                border: "1.5px solid " + (episodeSort === mode.id ? t.a : t.b),
                                background: episodeSort === mode.id ? t.ad : t.s,
                                color: episodeSort === mode.id ? t.a : t.tm,
                                fontSize: 11, fontWeight: 700,
                                transition: "all 0.15s",
                              }}
                            >
                              {mode.label}
                            </button>
                          ))}
                        </div>
                        {episodesLoading ? (
                          <div style={{ textAlign: "center", padding: "20px 0", color: t.tm, fontSize: 13 }}>
                            ⏳ Ładowanie odcinków...
                          </div>
                        ) : sortedEps.map(ep => (
                          <div key={ep.id} style={{
                            background: t.sh, border: "1px solid " + t.b,
                            borderRadius: 12, padding: "11px 14px", marginBottom: 8,
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: 10, color: t.a, fontWeight: 700, marginRight: 6 }}>
                                  E{String(ep.number).padStart(2, "0")}
                                </span>
                                <span style={{ fontSize: 13, fontWeight: 700 }}>{ep.title}</span>
                              </div>
                              {ep.rating > 0 ? (
                                <span style={{
                                  fontSize: 10, fontWeight: 700, color: t.w,
                                  background: t.wa, padding: "2px 7px", borderRadius: 6,
                                  flexShrink: 0, marginLeft: 8,
                                }}>
                                  ⭐ {ep.rating}
                                </span>
                              ) : (
                                <span style={{ fontSize: 10, color: t.tm, flexShrink: 0, marginLeft: 8 }}>
                                  Brak oceny
                                </span>
                              )}
                            </div>
                            {ep.airDate && (
                              <div style={{ fontSize: 10, color: t.tm, marginBottom: ep.overview ? 5 : 0 }}>
                                {ep.airDate}
                              </div>
                            )}
                            {ep.overview && (
                              <div style={{
                                fontSize: 11, color: t.tm, lineHeight: 1.5,
                                overflow: "hidden", display: "-webkit-box",
                                WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                              }}>
                                {ep.overview}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <SectionHeader>Opis</SectionHeader>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: t.tm, margin: 0 }}>{m.synopsis}</p>
          </div>

          {/* Obsada */}
          <div style={{ marginBottom: 20 }}>
            <SectionHeader>Obsada</SectionHeader>
            {detailLoading ? (
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{ minWidth: 70, textAlign: "center", flexShrink: 0 }}>
                    <div className="skeleton" style={{ width: 64, height: 64, borderRadius: "50%", margin: "0 auto 8px" }} />
                    <div className="skeleton" style={{ height: 10, borderRadius: 4, margin: "0 4px 4px" }} />
                    <div className="skeleton" style={{ height: 8, borderRadius: 4, margin: "0 10px" }} />
                  </div>
                ))}
              </div>
            ) : selectedCredits.length > 0 ? (
              <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
                {selectedCredits.map(actor => (
                  <div key={actor.id} style={{ minWidth: 72, textAlign: "center", flexShrink: 0 }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: "50%",
                      overflow: "hidden", margin: "0 auto 8px",
                      background: t.sh, border: "2px solid " + t.b,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {actor.photo ? (
                        <img
                          src={actor.photo}
                          alt={actor.name}
                          loading="lazy"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span style={{ fontSize: 26 }}>👤</span>
                      )}
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 700, lineHeight: 1.3,
                      marginBottom: 2, overflow: "hidden",
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}>
                      {actor.name}
                    </div>
                    <div style={{
                      fontSize: 10, color: t.tm, lineHeight: 1.2,
                      overflow: "hidden", whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}>
                      {actor.character}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Gdzie obejrzeć */}
          <div style={{ marginBottom: 20 }}>
            <SectionHeader>Gdzie obejrzeć w Polsce</SectionHeader>
            {detailLoading ? (
              <div>
                {[...Array(2)].map((_, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: t.s, border: "1.5px solid " + t.b,
                    borderRadius: 14, padding: "12px 16px", marginBottom: 8,
                  }}>
                    <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 14, borderRadius: 4, marginBottom: 6 }} />
                      <div className="skeleton" style={{ height: 11, borderRadius: 4, width: "50%" }} />
                    </div>
                    <div className="skeleton" style={{ width: 70, height: 32, borderRadius: 10 }} />
                  </div>
                ))}
              </div>
            ) : providerGroups.length > 0 ? (
              providerGroups.map(group => (
                <div key={group.label} style={{ marginBottom: 16 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: t.tm,
                    textTransform: "uppercase", letterSpacing: 1,
                    marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span>{group.icon}</span> {group.label}
                  </div>
                  {group.items.map(p => (
                    <div key={p.provider_id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: t.s, border: "1.5px solid " + t.b,
                      borderRadius: 14, padding: "12px 16px", marginBottom: 8,
                      boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12, overflow: "hidden",
                        background: t.sh, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {p.logo_path ? (
                          <img
                            src={`${LOGO_URL}${p.logo_path}`}
                            alt={p.provider_name}
                            loading="lazy"
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }}
                          />
                        ) : (
                          <span style={{ fontSize: 18, fontWeight: 800, color: t.a }}>
                            {p.provider_name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{p.provider_name}</div>
                        <div style={{ fontSize: 11, color: t.tm, marginTop: 1 }}>{group.label}</div>
                      </div>
                      <a
                        href={selectedProviders?.link ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => { if (!selectedProviders?.link) e.preventDefault(); }}
                        style={{
                          fontSize: 12, fontWeight: 700, color: t.a,
                          padding: "7px 16px", borderRadius: 10,
                          background: t.ad, border: "1px solid " + t.ab,
                          textDecoration: "none", whiteSpace: "nowrap",
                        }}
                      >
                        {group.label === "Streaming" ? "Oglądaj" : group.label === "Wypożyczenie" ? "Wypożycz" : "Kup"}
                      </a>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div style={{
                background: t.s, border: "1px solid " + t.b,
                borderRadius: 14, padding: "20px 16px",
                textAlign: "center", color: t.tm, fontSize: 13,
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🌍</div>
                Brak dostępnych platform w Polsce
              </div>
            )}
          </div>

          {/* Podobne / Rekomendowane filmy */}
          {similarMovies.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader>{similarLabel}</SectionHeader>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                {similarMovies.slice(0, 8).map(s => (
                  <MovieCard key={s.id} movie={s} onOpen={openMovie} compact />
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => toggleSaved(m.id, m.mediaType ?? "movie")}
              style={{
                width: "100%", padding: "16px", borderRadius: 16,
                border: "2px solid " + (isSaved(m.id) ? t.a : t.b),
                background: isSaved(m.id) ? t.ad : t.s,
                color: isSaved(m.id) ? t.a : t.tx,
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, transition: "all 0.15s",
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
    const filteredSports = filterByDiscipline(SPORTS_EVENTS, sportsDiscipline);
    return (
      <div style={WRAP}>
        <div style={{ padding: "22px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo />
          <ThemeToggle darkMode={darkMode} toggle={toggleTheme} />
        </div>
        <div style={{ padding: "8px 20px 16px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>⚽ Sport na żywo</h2>
          <p style={{ fontSize: 13, color: t.tm, margin: "4px 0 0" }}>Najbliższe transmisje w Polsce</p>
        </div>
        <div style={{ padding: "0 20px 16px", display: "flex", gap: 8, overflowX: "auto" }}>
          {DISCIPLINES.map(d => (
            <button
              key={d.id}
              onClick={() => setSportsDiscipline(d.id)}
              style={{
                flexShrink: 0,
                padding: "7px 14px", borderRadius: 20,
                border: "1.5px solid " + (sportsDiscipline === d.id ? t.a : t.b),
                background: sportsDiscipline === d.id ? t.ad : t.s,
                color: sportsDiscipline === d.id ? t.a : t.tm,
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                whiteSpace: "nowrap", transition: "all 0.15s",
              }}
            >
              {d.icon} {d.label}
            </button>
          ))}
        </div>
        <div style={{ padding: "0 20px" }}>
          {filteredSports.length > 0
            ? filteredSports.map(s => <SportCard key={s.id} sport={s} />)
            : (
              <div style={{ textAlign: "center", padding: "48px 0", color: t.tm }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
                <div style={{ fontSize: 14 }}>Brak wydarzeń w tej kategorii</div>
              </div>
            )
          }
        </div>
        <Navigation screen={screen} setScreen={setScreen} />
      </div>
    );
  }

  // ====== SAVED ======
  // Łączy popularne, wyniki wyszukiwania i cache filmów z poprzednich sesji
  const savedList = [...popularMovies, ...searchResults, ...Object.values(savedMoviesCache)].filter(
    (m, i, arr) => savedMovies.includes(m.id) && arr.findIndex(x => x.id === m.id) === i
  );

  // Oblicz ranking platform (flatrate = streaming)
  const platformCounts = {};
  savedList.forEach(m => {
    const providers = savedProvidersMap[m.id];
    if (!providers) return;
    const seen = new Set();
    (providers.flatrate ?? []).forEach(p => {
      if (!seen.has(p.provider_name)) {
        seen.add(p.provider_name);
        platformCounts[p.provider_name] = (platformCounts[p.provider_name] || 0) + 1;
      }
    });
  });
  const platformRanking = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count, price: PLATFORM_PRICES[name] ?? null }));

  const hasProviderData = savedList.length > 0 && savedList.some(m => m.id in savedProvidersMap);
  const RANK_ICONS = ["🏆", "🥈", "🥉"];

  return (
    <div style={WRAP}>
      <div style={{ padding: "22px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Logo />
        <ThemeToggle darkMode={darkMode} toggle={toggleTheme} />
      </div>
      <div style={{ padding: "8px 20px 20px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>❤️ Moja lista</h2>
        <p style={{ fontSize: 13, color: t.tm, margin: "4px 0 0" }}>
          {savedMovies.length > 0
            ? `${savedMovies.length} ${savedMovies.length === 1 ? "tytuł" : savedMovies.length < 5 ? "tytuły" : "tytułów"}`
            : "Brak zapisanych tytułów"}
        </p>
      </div>

      {/* Porównywarka subskrypcji */}
      {(savedList.length > 0 || (savedCacheLoading && savedMovies.length > 0)) && (
        <div style={{ padding: "0 20px", marginBottom: 24 }}>
          <SectionHeader>Najlepsza subskrypcja dla Ciebie</SectionHeader>
          {savedProvidersLoading && !hasProviderData ? (
            [...Array(2)].map((_, i) => (
              <div key={i} style={{
                background: t.s, border: "1px solid " + t.b,
                borderRadius: 14, padding: "14px 16px", marginBottom: 8,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 14, borderRadius: 4, marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 11, borderRadius: 4, width: "60%" }} />
                </div>
                <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 10 }} />
              </div>
            ))
          ) : platformRanking.length > 0 ? (
            platformRanking.map(({ name, count, price }, i) => (
              <div key={name} className="card-fade-in" style={{
                background: i === 0 ? t.ad : t.s,
                border: "1.5px solid " + (i === 0 ? t.ab : t.b),
                borderRadius: 14, padding: "14px 16px", marginBottom: 8,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: i === 0 ? t.ab : t.sh,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>
                  {RANK_ICONS[i]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: i === 0 ? t.a : t.tx }}>
                    {name}
                  </div>
                  <div style={{ fontSize: 12, color: t.tm, marginTop: 2 }}>
                    pokrywa {count} z {savedList.length} {savedList.length === 1 ? "tytułu" : "tytułów"}
                  </div>
                </div>
                {price && (
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: i === 0 ? t.a : t.tm,
                    background: i === 0 ? t.ab : t.sh,
                    padding: "4px 10px", borderRadius: 10,
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    {price}
                  </span>
                )}
              </div>
            ))
          ) : hasProviderData ? (
            <div style={{
              background: t.s, border: "1px solid " + t.b,
              borderRadius: 14, padding: "16px",
              textAlign: "center", color: t.tm, fontSize: 13,
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🌍</div>
              Żaden z Twoich tytułów nie ma platform streamingowych w Polsce
            </div>
          ) : null}
        </div>
      )}

      <div style={{ padding: "0 20px" }}>
        {savedCacheLoading && savedMovies.length > 0 && savedList.length === 0 ? (
          [...Array(Math.min(savedMovies.length, 3))].map((_, i) => <SkeletonCard key={i} />)
        ) : savedList.length > 0 ? savedList.map(m => (
          <MovieCard
            key={m.id} movie={m}
            onOpen={openMovie}
            onToggleSaved={toggleSaved}
            saved
          />
        )) : (
          <div style={{ textAlign: "center", padding: "60px 20px", color: t.tm }}>
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
