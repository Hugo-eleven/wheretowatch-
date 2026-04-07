const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
export const POSTER_URL = "https://image.tmdb.org/t/p/w500";
export const LOGO_URL = "https://image.tmdb.org/t/p/w45";

const GENRE_MAP = {
  28: "Akcja", 12: "Przygodowy", 16: "Animacja", 35: "Komedia",
  80: "Kryminał", 99: "Dokumentalny", 18: "Dramat", 10751: "Familijny",
  14: "Fantasy", 36: "Historyczny", 27: "Horror", 10402: "Muzyczny",
  9648: "Mystery", 10749: "Romans", 878: "Sci-Fi",
  53: "Thriller", 10752: "Wojenny", 37: "Western",
};

/** Mapuje surowy obiekt TMDB na format używany przez aplikację. */
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
    duration: m.runtime ? `${Math.floor(m.runtime / 60)}h ${m.runtime % 60}m` : null,
    synopsis: m.overview || "Brak opisu.",
    platforms: [],
  };
}

function apiFetch(path, extraParams = "") {
  const sep = path.includes("?") ? "&" : "?";
  return fetch(
    `${BASE_URL}${path}${sep}api_key=${API_KEY}&language=pl-PL${extraParams}`
  ).then(res => {
    if (!res.ok) throw new Error(`TMDB błąd ${res.status}`);
    return res.json();
  });
}

/** Popularne filmy — zwraca tablicę zmapowanych filmów. */
export function fetchPopular() {
  return apiFetch("/movie/popular").then(data => data.results.map(mapMovie));
}

/** Filmy najwyżej oceniane — zwraca tablicę zmapowanych filmów. */
export function fetchTopRated() {
  return apiFetch("/movie/top_rated").then(data => data.results.map(mapMovie));
}

/** Wyszukiwanie po frazie — zwraca tablicę zmapowanych filmów. */
export function searchMovies(query) {
  if (!query.trim()) return Promise.resolve([]);
  return apiFetch(`/search/movie?query=${encodeURIComponent(query)}`).then(
    data => data.results.map(mapMovie)
  );
}

/**
 * Platformy streamingowe dla danego filmu w Polsce.
 * Zwraca obiekt `{ flatrate, rent, buy }` lub `null` gdy brak danych dla PL.
 */
export function fetchWatchProviders(movieId) {
  return apiFetch(`/movie/${movieId}/watch/providers`, "&region=PL").then(
    data => data.results?.PL ?? null
  );
}

/** Pełne szczegóły filmu (runtime, gatunki, itp.). */
export function fetchMovieDetails(movieId) {
  return apiFetch(`/movie/${movieId}`).then(mapMovie);
}
