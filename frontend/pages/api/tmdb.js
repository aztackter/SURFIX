// FIX: TMDB lookups moved server-side so the API key is never exposed
// in the browser bundle (NEXT_PUBLIC_ prefix sends it to the client).
// The watch page now calls /api/tmdb?imdbId=... or /api/tmdb?title=...&year=...

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const TMDB_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_KEY) {
    return res.status(500).json({ error: 'TMDB API key not configured' });
  }

  const { imdbId, title, year } = req.query;

  try {
    // Strategy 1: look up by IMDb ID
    if (imdbId) {
      const response = await fetch(
        `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_KEY}&external_source=imdb_id`
      );
      const data = await response.json();
      const result = data.movie_results?.[0];
      if (result) {
        return res.status(200).json({ success: true, tmdbId: result.id });
      }
    }

    // Strategy 2: search by title + optional year
    if (title) {
      const params = new URLSearchParams({ api_key: TMDB_KEY, query: title });
      if (year) params.set('year', year);

      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?${params}`
      );
      const data = await response.json();
      const result = data.results?.[0];
      if (result) {
        return res.status(200).json({ success: true, tmdbId: result.id });
      }
    }

    return res.status(404).json({ success: false, error: 'TMDB ID not found' });
  } catch (error) {
    res.status(500).json({ error: 'TMDB lookup failed', message: error.message });
  }
}
