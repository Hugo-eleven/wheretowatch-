import { useState, useEffect } from "react";
import { t } from "./theme";
import { SPORTS_EVENTS, DISCIPLINES, filterByDiscipline } from "./services/sports";
import {
  fetchPopular, fetchTopRated, searchMulti,
  fetchDetails, fetchProviders, fetchCredits, fetchSimilar, fetchEpisodes,
  fetchExternalIds, fetchVideos, LOGO_URL,
} from "./services/tmdb";
import { fetchOMDbRatings } from "./services/omdb";
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
      display: "flex", alignItems: "center", gap: 8,
      fontSize: 11, fontWeight: 800, color: t.tm,
      textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12,
    }}>
      <div style={{ width: 3, height: 14, borderRadius: 2, background: t.a }} />
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: "48px 0", color: t.tm }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
      <div style={{ fontSize: 13 }}>Ładowanie...</div>
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

  // Zapisuj ulubione do localStorage przy każdej zmianie
  useEffect(() => {
    localStorage.setItem("wtw_saved", JSON.stringify(savedMovies));
  }, [savedMovies]);

  // Ładuj popularne i top rated przy starcie
  useEffect(() => {
    Promise.all([fetchPopular(), fetchTopRated()])
      .then(([popular, topRated]) => {
        setPopularMovies(popular);
        setTopRatedMovies(topRated);
        setHomeLoading(false);
      })
      .catch(err => {
        setHomeError(err.message);
        setHomeLoading(false);
      });
  }, []);

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
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      setSimilarMovies(similar);
      setTrailerKey(videoKey);

      // OMDb: najpierw pobierz IMDb ID, potem oceny
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

  function toggleSaved(id) {
    setSavedMovies(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
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

  // ====== HOME ======
  if (screen === "home") {
    return (
      <div style={WRAP}>
        <div style={{ padding: "22px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo />
          <span style={{
            background: t.ad, color: t.a, fontSize: 10,
            fontWeight: 700, padding: "3px 10px", borderRadius: 20,
            border: "1px solid " + t.ab,
          }}>
            v0.1
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

        {homeError ? (
          <ErrorMsg msg={homeError} />
        ) : homeLoading ? (
          <Spinner />
        ) : (
          <>
            {/* Popularne teraz */}
            <div style={{ padding: "0 20px", marginBottom: 28 }}>
              <SectionHeader>Popularne teraz</SectionHeader>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
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
        <div style={{ padding: "22px 20px 10px" }}><Logo /></div>
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
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "0 20px" }}>
          {searchLoading ? (
            <Spinner />
          ) : visibleResults.length > 0 ? (
            visibleResults.map(m => (
              <MovieCard
                key={m.id} movie={m}
                onOpen={openMovie}
                onToggleSaved={toggleSaved}
                saved={isSaved(m.id)}
              />
            ))
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
        <div style={{ padding: "16px 20px" }}>
          <button
            onClick={() => setScreen(prevScreen)}
            style={{
              background: t.s, border: "1px solid " + t.b,
              borderRadius: 10, color: t.a, fontSize: 13,
              fontWeight: 700, cursor: "pointer", padding: "7px 14px",
            }}
          >
            ← Wróć
          </button>
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
                  style={{ width: "100%", maxHeight: 300, objectFit: "cover", display: "block" }}
                />
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(transparent, rgba(11,15,26,0.95))",
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
                    fontWeight: 700, background: "rgba(0,229,160,0.12)", color: t.a,
                    border: "1px solid rgba(0,229,160,0.25)",
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
                    fontWeight: 700, background: "rgba(255,77,106,0.12)", color: t.d,
                    border: "1px solid rgba(255,77,106,0.25)",
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
              <div style={{
                position: "relative", paddingBottom: "56.25%", height: 0,
                borderRadius: 16, overflow: "hidden",
                boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
              }}>
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}`}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Trailer"
                />
              </div>
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
                                <span style={{
                                  fontSize: 10, color: t.tm, flexShrink: 0, marginLeft: 8,
                                }}>
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
                  <div key={i} style={{
                    minWidth: 70, textAlign: "center", flexShrink: 0,
                  }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: "50%",
                      background: t.sh, margin: "0 auto 8px",
                    }} />
                    <div style={{ height: 10, background: t.sh, borderRadius: 4, margin: "0 4px 4px" }} />
                    <div style={{ height: 8, background: t.b, borderRadius: 4, margin: "0 10px" }} />
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
                      background: t.sh,
                      border: "2px solid " + t.b,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {actor.photo ? (
                        <img
                          src={actor.photo}
                          alt={actor.name}
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
              <div style={{ padding: "20px 0", color: t.tm, fontSize: 13, textAlign: "center" }}>
                ⏳ Sprawdzam dostępność...
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

          {/* Podobne filmy */}
          {similarMovies.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <SectionHeader>Podobne filmy</SectionHeader>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                {similarMovies.slice(0, 5).map(s => (
                  <MovieCard key={s.id} movie={s} onOpen={openMovie} compact />
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => toggleSaved(m.id)}
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
        <div style={{ padding: "22px 20px 10px" }}><Logo /></div>
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
                padding: "7px 14px",
                borderRadius: 20,
                border: "1.5px solid " + (sportsDiscipline === d.id ? t.a : t.b),
                background: sportsDiscipline === d.id ? t.ad : t.s,
                color: sportsDiscipline === d.id ? t.a : t.tm,
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                whiteSpace: "nowrap",
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
  const savedList = [...popularMovies, ...searchResults].filter(
    (m, i, arr) => savedMovies.includes(m.id) && arr.findIndex(x => x.id === m.id) === i
  );

  return (
    <div style={WRAP}>
      <div style={{ padding: "22px 20px 10px" }}><Logo /></div>
      <div style={{ padding: "8px 20px 20px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>❤️ Moja lista</h2>
        <p style={{ fontSize: 13, color: t.tm, margin: "4px 0 0" }}>
          {savedMovies.length > 0
            ? `${savedMovies.length} ${savedMovies.length === 1 ? "tytuł" : savedMovies.length < 5 ? "tytuły" : "tytułów"}`
            : "Brak zapisanych tytułów"}
        </p>
      </div>
      <div style={{ padding: "0 20px" }}>
        {savedList.length > 0 ? savedList.map(m => (
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
