const API_KEY = process.env.REACT_APP_OMDB_API_KEY;

/**
 * Pobiera oceny z OMDb na podstawie IMDb ID.
 * Zwraca { imdb, rottenTomatoes } lub null gdy brak danych.
 */
export async function fetchOMDbRatings(imdbId) {
  if (!imdbId) return null;
  const res = await fetch(
    `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbId}`
  );
  if (!res.ok) return null;
  const d = await res.json();
  if (d.Response === "False") return null;

  const rt = d.Ratings?.find(r => r.Source === "Rotten Tomatoes");
  return {
    imdb: d.imdbRating && d.imdbRating !== "N/A" ? d.imdbRating : null,
    rottenTomatoes: rt?.Value ?? null,
  };
}
