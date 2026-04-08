import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL || '';
const key = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// supabase będzie null jeśli klucze nie są ustawione
export const supabase = (url && key && !url.includes('twoj-projekt'))
  ? createClient(url, key)
  : null;

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

export async function loadSavedFromSupabase(userId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('favorites')
    .select('movie_id, movie_type, title, poster_path, vote_average')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });
  if (error || !data) return null;

  const ids = data.map(r => r.movie_id);
  const types = {};
  const cache = {};
  data.forEach(r => {
    types[r.movie_id] = r.movie_type ?? 'movie';
    if (r.title) {
      cache[r.movie_id] = {
        id: r.movie_id,
        title: r.title,
        poster: r.poster_path ? `${POSTER_BASE}${r.poster_path}` : null,
        imdb: r.vote_average ?? null,
        mediaType: r.movie_type ?? 'movie',
        year: null,
        genre: null,
        duration: null,
        synopsis: null,
        platforms: [],
      };
    }
  });
  return { ids, types, cache };
}

export async function addSavedToSupabase(userId, movie) {
  if (!supabase || !movie?.id) return;
  const posterPath = movie.poster
    ? movie.poster.replace(POSTER_BASE, '')
    : null;
  await supabase.from('favorites').upsert({
    user_id: userId,
    movie_id: movie.id,
    movie_type: movie.mediaType ?? 'movie',
    title: movie.title ?? null,
    poster_path: posterPath,
    vote_average: movie.imdb ?? null,
  }, { onConflict: 'user_id,movie_id' });
}

export async function removeSavedFromSupabase(userId, movieId) {
  if (!supabase) return;
  await supabase.from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('movie_id', movieId);
}
