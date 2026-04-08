import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL || '';
const key = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// supabase będzie null jeśli klucze nie są ustawione
export const supabase = (url && key && !url.includes('twoj-projekt'))
  ? createClient(url, key)
  : null;

export async function loadSavedFromSupabase(userId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('saved_movies')
    .select('movie_id, media_type')
    .eq('user_id', userId);
  if (error || !data) return null;
  const ids = data.map(r => r.movie_id);
  const types = {};
  data.forEach(r => { types[r.movie_id] = r.media_type; });
  return { ids, types };
}

export async function addSavedToSupabase(userId, movieId, mediaType) {
  if (!supabase) return;
  await supabase.from('saved_movies').upsert({
    user_id: userId,
    movie_id: movieId,
    media_type: mediaType,
  });
}

export async function removeSavedFromSupabase(userId, movieId) {
  if (!supabase) return;
  await supabase.from('saved_movies')
    .delete()
    .eq('user_id', userId)
    .eq('movie_id', movieId);
}
