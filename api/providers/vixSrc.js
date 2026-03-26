import axios from 'axios';

export default {
  name: 'VixSrc',

  getMovie: async (tmdbId) => {
    const url = `https://vixsrc.net/embed/movie/${tmdbId}`;
    try {
      const response = await axios.head(url, { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (response.status === 200) return [{ url, quality: '1080p', provider: 'VixSrc', type: 'iframe' }];
    } catch { }
    return [];
  },

  getTv: async (tmdbId, season, episode) => {
    const url = `https://vixsrc.net/embed/tv/${tmdbId}/${season}/${episode}`;
    try {
      const response = await axios.head(url, { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (response.status === 200) return [{ url, quality: '1080p', provider: 'VixSrc', type: 'iframe' }];
    } catch { }
    return [];
  }
};
