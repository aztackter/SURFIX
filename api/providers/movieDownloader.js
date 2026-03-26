import axios from 'axios';

export default {
  name: 'MovieDownloader',

  getMovie: async (tmdbId) => {
    const url = `https://02moviedownloader.com/embed/movie/${tmdbId}`;
    try {
      const response = await axios.head(url, { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (response.status === 200) return [{ url, quality: 'HD', provider: 'MovieDownloader', type: 'iframe' }];
    } catch { }
    return [];
  },

  getTv: async (tmdbId, season, episode) => {
    const url = `https://02moviedownloader.com/embed/tv/${tmdbId}/${season}/${episode}`;
    try {
      const response = await axios.head(url, { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (response.status === 200) return [{ url, quality: 'HD', provider: 'MovieDownloader', type: 'iframe' }];
    } catch { }
    return [];
  }
};
