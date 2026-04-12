const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
export const POSTER_URL = "https://image.tmdb.org/t/p/w500";
export const LOGO_URL = "https://image.tmdb.org/t/p/w92";
export const PROFILE_URL = "https://image.tmdb.org/t/p/w185";

const GENRE_MAP = {
  28: "Akcja", 12: "Przygodowy", 16: "Animacja", 35: "Komedia",
  80: "Kryminał", 99: "Dokumentalny", 18: "Dramat", 10751: "Familijny",
  14: "Fantasy", 36: "Historyczny", 27: "Horror", 10402: "Muzyczny",
  9648: "Mystery", 10749: "Romans", 878: "Sci-Fi",
  53: "Thriller", 10752: "Wojenny", 37: "Western",
};

function apiFetch(path, extraParams = "") {
  const sep = path.includes("?") ? "&" : "?";
  return fetch(
    `${BASE_URL}${path}${sep}api_key=${API_KEY}&language=pl-PL${extraParams}`
  ).then(res => {
    if (!res.ok) throw new Error(`TMDB błąd ${res.status}`);
    return res.json();
  });
}

/** Mapuje film z TMDB na format aplikacji. */
export function mapMovie(m) {
  const genreId = m.genre_ids?.[0] ?? m.genres?.[0]?.id;
  const genreName = m.genres?.[0]?.name ?? GENRE_MAP[genreId] ?? "Film";
  return {
    id: m.id,
    title: m.title,
    year: m.release_date?.slice(0, 4) ?? "—",
    genre: genreName,
    imdb: m.vote_average != null ? Number(m.vote_average.toFixed(1)) : null,
    poster: m.poster_path ? `${POSTER_URL}${m.poster_path}` : null,
    backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
    duration: m.runtime ? `${Math.floor(m.runtime / 60)}h ${m.runtime % 60}m` : null,
    synopsis: m.overview || "Brak opisu.",
    platforms: [],
    mediaType: "movie",
  };
}

/** Mapuje serial (TV) z TMDB na format aplikacji. */
function mapTV(m) {
  const genre = m.genres?.[0]?.name ?? "Serial";
  const seasons = m.number_of_seasons;
  return {
    id: m.id,
    title: m.name,
    year: m.first_air_date?.slice(0, 4) ?? "—",
    genre,
    imdb: m.vote_average != null ? Number(m.vote_average.toFixed(1)) : null,
    poster: m.poster_path ? `${POSTER_URL}${m.poster_path}` : null,
    duration: seasons ? `${seasons} sezon${seasons === 1 ? "" : seasons < 5 ? "y" : "ów"}` : null,
    seasons: seasons ?? null,
    episodes: m.number_of_episodes ?? null,
    status: m.status ?? null,
    synopsis: m.overview || "Brak opisu.",
    platforms: [],
    mediaType: "tv",
    seasonsList: (m.seasons ?? [])
      .filter(s => s.season_number > 0)
      .map(s => ({
        number: s.season_number,
        name: s.name,
        episodeCount: s.episode_count,
        airDate: s.air_date?.slice(0, 4) ?? null,
        poster: s.poster_path ? `${POSTER_URL}${s.poster_path}` : null,
      })),
  };
}

/** Mapuje serial z listy (trending/search) — bez pełnych szczegółów. */
function mapTVList(m) {
  const genreId = m.genre_ids?.[0] ?? m.genres?.[0]?.id;
  const genreName = m.genres?.[0]?.name ?? GENRE_MAP[genreId] ?? "Serial";
  return {
    id: m.id,
    title: m.name,
    year: m.first_air_date?.slice(0, 4) ?? "—",
    genre: genreName,
    imdb: m.vote_average != null ? Number(m.vote_average.toFixed(1)) : null,
    poster: m.poster_path ? `${POSTER_URL}${m.poster_path}` : null,
    backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
    duration: null,
    synopsis: m.overview || "Brak opisu.",
    platforms: [],
    mediaType: "tv",
  };
}

/** Mapuje wynik /search/multi (movie lub tv). */
function mapMultiResult(item) {
  if (item.media_type === "tv") return mapTVList(item);
  return mapMovie(item);
}

// ── Endpointy ────────────────────────────────────────────────────────────────

const RU_UK = ["ru", "uk"];
function notRuUk(m) { return !RU_UK.includes(m.original_language); }

export function fetchPopular() {
  return apiFetch("/movie/popular").then(d =>
    d.results.filter(m => (m.vote_count ?? 0) >= 50).filter(notRuUk).map(mapMovie)
  );
}

export function fetchTopRated() {
  return apiFetch("/movie/top_rated").then(d => d.results.filter(notRuUk).map(mapMovie));
}

/** Wyszukuje filmy i seriale jednocześnie (/search/multi). */
export function searchMulti(query) {
  if (!query.trim()) return Promise.resolve([]);
  return apiFetch(`/search/multi?query=${encodeURIComponent(query)}`).then(d =>
    d.results
      .filter(item => item.media_type === "movie" || item.media_type === "tv")
      .map(mapMultiResult)
  );
}

/** Pełne szczegóły — film lub serial. */
export function fetchDetails(id, mediaType = "movie") {
  const path = mediaType === "tv" ? `/tv/${id}` : `/movie/${id}`;
  return apiFetch(path).then(mediaType === "tv" ? mapTV : mapMovie);
}

/**
 * Platformy streamingowe dla Polski.
 * Zwraca { flatrate, rent, buy } lub null.
 */
export function fetchProviders(id, mediaType = "movie") {
  const path = mediaType === "tv"
    ? `/tv/${id}/watch/providers`
    : `/movie/${id}/watch/providers`;
  return apiFetch(path, "&region=PL").then(d => d.results?.PL ?? null);
}

/** Obsada — pierwsze 5 aktorów. */
export function fetchCredits(id, mediaType = "movie") {
  const path = mediaType === "tv"
    ? `/tv/${id}/credits`
    : `/movie/${id}/credits`;
  return apiFetch(path).then(d =>
    (d.cast ?? []).slice(0, 5).map(a => ({
      id: a.id,
      name: a.name,
      character: a.character,
      photo: a.profile_path ? `${PROFILE_URL}${a.profile_path}` : null,
    }))
  );
}

/** IMDb ID i inne zewnętrzne identyfikatory. */
export function fetchExternalIds(id, mediaType = "movie") {
  const path = mediaType === "tv" ? `/tv/${id}/external_ids` : `/movie/${id}/external_ids`;
  return apiFetch(path).then(d => d.imdb_id ?? null);
}

/** Pierwszy dostępny trailer YouTube: Trailer → Teaser → cokolwiek.
 *  Najpierw próbuje pl-PL, potem en-US (większość trailerów jest po angielsku). */
export function fetchVideos(id, mediaType = "movie") {
  const path = mediaType === "tv" ? `/tv/${id}/videos` : `/movie/${id}/videos`;

  function pickYT(results) {
    const yt = (results ?? []).filter(v => v.site === "YouTube");
    return yt.find(v => v.type === "Trailer") ||
           yt.find(v => v.type === "Teaser") ||
           yt[0] ||
           null;
  }

  // Krok 1: pl-PL
  return apiFetch(path).then(d => {
    const plVideos = d.results ?? [];
    console.log(`[Videos] ${path} pl-PL: ${plVideos.length} wyników`);
    const pick = pickYT(plVideos);
    if (pick) {
      console.log(`[Videos] Wybrany (pl): ${pick.type} "${pick.name}" key=${pick.key}`);
      return pick.key;
    }
    // Krok 2: en-US (trailery są głównie po angielsku)
    return fetch(`${BASE_URL}${path}?api_key=${API_KEY}&language=en-US`)
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d2 => {
        const enVideos = d2.results ?? [];
        console.log(`[Videos] ${path} en-US: ${enVideos.length} wyników`);
        const pick2 = pickYT(enVideos);
        if (pick2) {
          console.log(`[Videos] Wybrany (en): ${pick2.type} "${pick2.name}" key=${pick2.key}`);
          return pick2.key;
        }
        console.log(`[Videos] Brak trailera dla ${path}`);
        return null;
      });
  });
}

/** Odcinki danego sezonu serialu. */
export function fetchEpisodes(id, seasonNumber) {
  return apiFetch(`/tv/${id}/season/${seasonNumber}`).then(d =>
    (d.episodes ?? []).map(e => ({
      id: e.id,
      number: e.episode_number,
      title: e.name,
      overview: e.overview || null,
      airDate: e.air_date ?? null,
      rating: e.vote_average != null ? Number(e.vote_average.toFixed(1)) : null,
      still: e.still_path ? `https://image.tmdb.org/t/p/w300${e.still_path}` : null,
    }))
  );
}

/** Podobne filmy/seriale — pierwsze 10. */
export function fetchSimilar(id, mediaType = "movie") {
  const path = mediaType === "tv"
    ? `/tv/${id}/similar`
    : `/movie/${id}/similar`;
  const mapper = mediaType === "tv" ? mapTVList : mapMovie;
  return apiFetch(path).then(d => d.results.slice(0, 10).map(mapper));
}

/** Rekomendacje dla filmu/serialu. */
export function fetchRecommendations(id, mediaType = "movie") {
  const path = mediaType === "tv"
    ? `/tv/${id}/recommendations`
    : `/movie/${id}/recommendations`;
  const mapper = mediaType === "tv" ? mapTVList : mapMovie;
  return apiFetch(path).then(d => d.results.slice(0, 10).map(mapper));
}

/** Top 10 trendujących filmów tygodnia. */
export function fetchTrendingMovies() {
  return apiFetch("/trending/movie/week", "&region=PL")
    .then(d => d.results.filter(notRuUk).slice(0, 10).map(mapMovie));
}

/** Top 10 trendujących seriali tygodnia. */
export function fetchTrendingTV() {
  return apiFetch("/trending/tv/week")
    .then(d => d.results.filter(notRuUk).slice(0, 10).map(mapTVList));
}

/** Nadchodzące premiery kinowe w Polsce — strony 1 i 2. */
export function fetchUpcoming() {
  return Promise.all([
    apiFetch("/movie/upcoming", "&region=PL&page=1"),
    apiFetch("/movie/upcoming", "&region=PL&page=2"),
  ]).then(pages => {
    const seen = new Set();
    return pages.flatMap(p => p.results ?? [])
      .filter(m => {
        if (!m.release_date || seen.has(m.id)) return false;
        if (!notRuUk(m)) return false;
        seen.add(m.id);
        return true;
      })
      .sort((a, b) => a.release_date.localeCompare(b.release_date))
      .slice(0, 20)
      .map(m => ({ ...mapMovie(m), releaseDate: m.release_date }));
  });
}

/** Pełny kalendarz premier — 3 strony TMDB (ok. 60 filmów). */
export function fetchUpcomingCalendar() {
  return Promise.all([
    apiFetch("/movie/upcoming", "&region=PL&page=1"),
    apiFetch("/movie/upcoming", "&region=PL&page=2"),
    apiFetch("/movie/upcoming", "&region=PL&page=3"),
  ]).then(pages => {
    const seen = new Set();
    const all = pages.flatMap(p => p.results ?? []);
    return all
      .filter(m => {
        if (!m.release_date || seen.has(m.id)) return false;
        if (!notRuUk(m)) return false;
        seen.add(m.id);
        return true;
      })
      .sort((a, b) => a.release_date.localeCompare(b.release_date))
      .map(m => ({ ...mapMovie(m), releaseDate: m.release_date, original_language: m.original_language }));
  });
}
