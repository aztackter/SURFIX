import axios from 'axios';

export default {
  name: 'Uembed',

  getMovie: async (tmdbId) => {
    const url = `https://uembed.net/embed/movie/${tmdbId}`;
    try {
      const response = await axios.head(url, { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (response.status === 200) return [{ url, quality: 'HD', provider: 'Uembed', type: 'iframe' }];
    } catch { }
    return [];
  },

  getTv: async (tmdbId, season, episode) => {
    const url = `https://uembed.net/embed/tv/${tmdbId}/${season}/${episode}`;
    try {
      const response = await axios.head(url, { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (response.status === 200) return [{ url, quality: 'HD', provider: 'Uembed', type: 'iframe' }];
    } catch { }
    return [];
  }
};
